name: Create or Update Jira Tickets for Multiple Repos

on:
  workflow_call:
    secrets:
      TECH_SERVICES_JIRA_URL:
        description: 'Jira URL passed from the caller workflow'
        required: true
      TECH_SERVICES_JIRA_EMAIL:
        description: 'Email address passed from the caller workflow'
        required: true
      TECH_SERVICES_JIRA_TOKEN:
        description: 'API token passed from the caller workflow'
        required: true
      TECH_SERVICES_GITHUB_TOKEN:
        description: 'GitHub Access Token with repo access'
        required: true

jobs:
  process-all-repos:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd #v4

      - name: Install prerequisites
        run: |
          sudo apt-get update
          sudo apt-get install -y jq

      - name: Process all repos
        env:
          GITHUB_TOKEN:   ${{ secrets.TECH_SERVICES_GITHUB_TOKEN }}
          JIRA_URL:       ${{ secrets.TECH_SERVICES_JIRA_URL }}
          JIRA_USERNAME:  ${{ secrets.TECH_SERVICES_JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.TECH_SERVICES_JIRA_TOKEN }}
        run: |
          set -euo pipefail

          for entry in $(jq -c '.[]' .github/workflows/repos.json); do
            REPO=$(echo "$entry" | jq -r '.repo')
            LABEL=$(echo "$entry" | jq -r '.label')
            REPO_NAME=${REPO##*/}

            echo
            echo "=== Processing $REPO_NAME (label: $LABEL) ==="

            # 1) List & filter Dependabot PRs
            PR_LIST=$(gh pr list \
              --repo "$REPO" \
              --base main \
              --state open \
              --json number,title,headRefName,author,labels \
              --search "label:dependencies")

            # filter down to Dependabot authors or dependency labels
            PR_LIST=$(echo "$PR_LIST" | jq '[.[] | select(
              (.author.login     | test("dependabot|app/dependabot"; "i")) or
              (.labels[]?.name   | test("dependency"; "i"))
            )]')

            echo "→ PRs found for $REPO_NAME:"
            if [[ $(echo "$PR_LIST" | jq 'length') -eq 0 ]]; then
              echo "   (none)"
              continue
            fi
            echo "$PR_LIST" | jq -r '.[] | "  - #\(.number): \(.title) (branch \(.headRefName), author \(.author.login))"'

            # 2) Build a single multiline description
            PR_DESCRIPTION=$(echo "$PR_LIST" \
              | jq -r \
              --arg repo "$REPO" \
              '.[] | "PR Number: \(.number)\n Title: \(.title)\n Branch: \(.headRefName)\n URL: https://github.com/\($repo)/pull/\(.number)\n"' )
            
            # 3) Search
            JQL="project = ND AND labels in (\"$LABEL\") AND labels in ("dependabot") AND status = Backlog"
            echo "→ Searching Jira: $JQL"
            
            RESP=$(curl -s -u "$JIRA_USERNAME:$JIRA_API_TOKEN" \
            -H "Content-Type: application/json" \
              "$JIRA_URL/rest/api/2/search?jql=$(printf '%s' "$JQL" | jq -s -R -r @uri)")
          
            ISSUE_COUNT=$(echo "$RESP" | jq '.issues|length')
            echo "→ Found $ISSUE_COUNT matching issues"
              
            ISSUE_ID=$(echo "$RESP" | jq -r '.issues[0].key // empty')
              
            # 4) Create or update
            if [[ "$ISSUE_COUNT" -eq 0 ]]; then
              echo "➕ Creating Jira issue for $REPO_NAME"
              PAYLOAD=$(
              jq -n --arg repo "$REPO_NAME" --arg desc "$PR_DESCRIPTION" --arg lbl "$LABEL" \
              '{ fields: {
              project: { key: "ND" },
              summary: "Dependabot PRs for \($repo)",
              description: "Repository: \($repo)\n\($desc)",
              issuetype: { name: "Story" },
              labels: ["dependabot", $lbl]
            }}'
              )
            
            CREATE=$(curl -s -w "\n%{http_code}" -u "$JIRA_USERNAME:$JIRA_API_TOKEN" \
                -X POST -H "Content-Type: application/json" \
                --data "$PAYLOAD" \
                "$JIRA_URL/rest/api/2/issue")
            
            HTTP_CODE=$(echo "$CREATE" | tail -n1)
            BODY=$(echo "$CREATE" | sed '$d')
            
            echo "→ Create HTTP status: $HTTP_CODE"
            echo "→ Create response body:"
            echo "$BODY" | jq .
            
            ISSUE_ID=$(echo "$BODY" | jq -r '.key // empty')
              else
            echo "🔄 Updating Jira issue $ISSUE_ID"
            NOW=$(date '+%Y-%m-%d %H:%M:%S')
            UPDATE_PAYLOAD=$(jq -n --arg repo "$REPO_NAME" --arg now "$NOW" --arg desc "$PR_DESCRIPTION" \
              '{ fields: {
              summary: "Dependabot PRs for \($repo)",
              description: "Updated on \($now)\nRepository: \($repo)\n\($desc)"
            }}'
              )
            curl -s -u "$JIRA_USERNAME:$JIRA_API_TOKEN" \
                -X PUT -H "Content-Type: application/json" \
                --data "$UPDATE_PAYLOAD" \
                "$JIRA_URL/rest/api/2/issue/$ISSUE_ID"
            fi
            
            # 5) Guard against missing ID
            if [[ -z "$ISSUE_ID" ]]; then
              echo "❌ ERROR: ISSUE_ID is empty after create/update – aborting."
              exit 1
            fi
            
            echo "✅ Jira ticket: $ISSUE_ID"

            # 6) Comment on each PR
            echo "💬 Commenting on Dependabot PRs"
            for NUM in $(echo "$PR_LIST" | jq -r '.[].number'); do
              gh pr comment "$NUM" \
                --repo "$REPO" \
                --body "$ISSUE_ID created or updated on Jira board"
            done

            # 7) Fetch Backlog transition ID
            TRANS_ID=$(curl -s -u "$JIRA_USERNAME:$JIRA_API_TOKEN" \
              -H "Content-Type: application/json" \
              "$JIRA_URL/rest/api/2/issue/$ISSUE_ID/transitions" \
              | jq -r '.transitions[] | select(.name=="Backlog") | .id')
            echo "💾 Backlog transition ID: $TRANS_ID"
          done