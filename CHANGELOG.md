# Changelog

## [1.1.0](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/compare/v1.0.0...v1.1.0) (2026-07-24)

### Features

* add GitHub User Guide with governance standards, best practices, and Terms of
  Service ([#370](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/370))
* add PostHog analytics integration with cookie consent
  ([#350](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/350))
* remove OCTO strategic docs and security guidance sources
  ([#339](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/339),
  [#340](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/340))

### Bug Fixes

* resolve lint failures in changelog formatting
  ([#341](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/341))
  ([4a44c36](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/4a44c36d0b24bc2d5683b419c0af4acfb2e2ad85))
* update nginx config to improve security and default page handling
  ([#352](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/352))
* remove `$uri/` from nginx to stop redirect loop
  ([#353](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/353))
* change Next.js `trailingSlash` behaviour
  ([#354](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/354))

## 1.0.0 (2026-06-29)

### Features

* add contact us page and code formatter
  ([#124](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/124))
  ([21c6d78](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/21c6d7858aa565e717d58fd4850bfc0e94e6fdae))
* Add cooldown to dependabot cooldown
  ([#190](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/190))
  ([0ece6fb](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/0ece6fbaa430e47d3de23724716535ae62eadc99))
* add global setup for tests, add test scripts, add vitest config
  ([#161](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/161))
  ([3c86b17](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/3c86b178c6aa1e5c31484917c8d9c768d240d6e4))
* add issue template config to enable template visibility
  ([#85](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/85))
  ([669b33d](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/669b33ddfc2e96d31552a930a776c342cdd07d28))
* add new script to docker required for postinstall
  ([#187](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/187))
  ([c2f16cc](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/c2f16cc7e58fc42e7e9583b9e17828cb1c07037d))
* add source for octo strategic docs
  ([#287](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/287))
  ([44bd4a1](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/44bd4a1182fd688f57e70b905c66f6dbb94de05d))
* add unit test CI
  ([#186](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/186))
  ([8ced8ae](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/8ced8aef93af24175bed7e0c215df8e6588984f4))
* change test scripts, add button tags to feedback widget
  ([#194](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/194))
  ([ee707e1](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/ee707e1f45f97cf6ae64b19ac5364188bbc87211))
* expand test suite
  ([#179](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/179))
  ([b1eb69d](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/b1eb69d9a7aabeb96f3d239d3c1a8cc145c7bd2c))
* fix project root structure
  ([#158](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/158))
  ([d94f74a](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/d94f74aa2974fb49407d0ddf75bc444d4ce913d4))
* **ingestion:** add cloud-optimisation-and-accountability source
  ([#236](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/236))
  ([83f732f](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/83f732f62ef511561e3cf9a5847318a31ccc5e80))
* **ingestion:** add cloud-optimisation-and-accountability source
  ([#240](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/240))
  ([9e4cf45](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/9e4cf4538ef27d35de2c1a5f9621addc8191e6e6))
* migrate to GitHub issue forms with project automation
  ([#79](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/79))
  ([09d9ea2](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/09d9ea28bbe3d1f944c3a408dd61e0d1594af997))
* more expansions to test suite
  ([#164](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/164))
  ([9cc9f78](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/9cc9f7829957d4590d534a30479d1f9fc8437c61))
* playwright initial setup
  ([#183](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/183))
  ([b541828](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/b5418282f1f5e8848bf2be10021aa26b4c5172bb))
* refactoring and tidying the guidelines and contact us
  ([#128](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/128))
  ([5b24f8a](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/5b24f8a0b5e2ae5b450e12933de821b8cb008409))
* restructure reusable mocks to make them easier to override and import
  ([#181](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/181))
  ([91e5e4b](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/91e5e4b5be3112f17763dd3447a975f09ee35fde))
* **seo:** add interim robots policy note
  ([#301](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/301))
  ([76d7005](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/76d70052324d09f14a926b2312a971d7cb498fef))
* test suite refinements
  ([#307](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/307))
  ([6a94f9e](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/6a94f9ed29370962816a389705ee05e7b3dd374a))
* tidy up types, create structure vs dumping ground for maintainability
  ([#291](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/291))
  ([881647d](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/881647d6768bb2a47539928dcf1e9f15b071d17d))
* update govuk frontend
  ([#286](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/286))
  ([197933a](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/197933aed48a9def123842d231582613df54d064))
* update sca to run jobs in parallel
  ([#320](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/320))
  ([1081250](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/108125098c9dabe35f4fcccfd03e2c641b70a22b))

### Bug Fixes

* remove empty title field from issue template
  ([#86](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/86))
  ([6e7202d](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/6e7202dd64f4938e595a658f0931ce6b2dc174d7))
* update favicon asserts
  ([#106](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/106))
  ([9d2290f](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/9d2290f706b128f0102ce9e7d548f9b8c1ec06ea))
* update flatted to patched version
  ([#36](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/36))
  ([2f2c716](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/2f2c716ba1f898b521c70bf9e80e41fd0b42f787))
* update repository references after repo rename
  ([#84](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/issues/84))
  ([fb2dd4c](https://github.com/ministryofjustice/ministry-of-justice-developer-portal/commit/fb2dd4cf1ca3dc26dd6ffae605da344fc5a7e46a))
