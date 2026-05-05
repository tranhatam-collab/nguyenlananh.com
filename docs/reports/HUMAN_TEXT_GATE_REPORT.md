# Human Text Gate Report

Verdict:
WEB_TEXT_GATE_PASS

Evidence checked:
- 241 HTML files in release scope.
- docs/HUMAN_TEXT_CHARACTER_AND_RESPONSE_PROTOCOL.md.
- docs/DEV_TEAM_RELEASE_DISCIPLINE.md link to the protocol.
- H1 count, empty headings, SEO metadata, canonical, Open Graph image, language, alt text, visible text symbols, and true state.

Pass:
- Human text blocking gate has zero issues.

Fail:
- None

Blocked by Founder:
- None.

Blocked by external asset:
- None.

True state:
HUMAN_TEXT_GATE_PASS

Team command:
Run `node scripts/human-text-gate.mjs --fail` before claiming any page is web-ready, SEO-ready, publication-ready, or release-ready.

Hard stop:
If this report has any Fail item, do not call the site web-ready.

Notes:
- Legacy editorial dash or arrow punctuation is reported as warning, not blocker, until a page-level editorial rewrite is approved.
- Approved language switch flags are not decorative copy and are excluded from character failures.

## Summary

- Generated at: 2026-05-05T14:36:04.649Z
- Pages audited: 241
- Total issues: 0
- Total warnings: 51

## Issue Counts

- None

## Warning Counts

- legacy_editorial_punctuation: 51

## URL Inventory

| URL | page role | H1 status | character hygiene | SEO metadata | canonical | OG image | alt text | language | true state | next action |
|---|---|---|---|---|---|---|---|---|---|---|
| /404.html | public | SKIPPED_404 | PASS | PASS | PASS | SKIPPED_404 | PASS | vi | NOINDEX | NONE |
| /admin/content/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /admin/creators/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /admin/dashboard/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /admin/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /admin/members/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /admin/payments/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /admin/settings/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /bai-viet/am-thanh-tu-than-khi-mot-tieng-hat-tro-thanh-cach-tro-ve/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/ban-khong-thieu-kien-thuc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/bon-truc-thay-doi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/cai-choi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/chi-can-dung/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/chua-tung-co-huong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/co-don-khong-phai-vi-thieu-nguoi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/co-nguoi-can-dung-lai/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/cong-dong-song-moi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/dau-tu-ban-than-hoc-tap-nhan-thuc-cao-hon/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/dau-tu-ban-than-khong-ao-tuong-doi-doi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/dau-tu-ban-than/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/dau-tu-hien-tai-tu-do-tuong-lai/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/di-vao-ben-trong-giai-ma-nhung-gi-dang-van-hanh-ban/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/di-vao-ben-trong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/dieu-ban-dang-tranh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/dieu-tre-em-can-khong-chi-la-day-dung/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/dong-chay-sang-tao-dong-chay-su-song/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/du-an-37-ngay/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/du-an-buoc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/du-an-nhat-ky/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/gan-duc-khoi-trong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/gia-dinh-khong-chi-la-noi-ta-lon-len/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/gia-tri-cuoc-doi-ban-dang-gia-bao-nhieu/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/gia-tri-nao-la-vinh-cuu-truoc-song-gio/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/gia-tri-noi-tai/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/hanh-trinh-di-vao-ben-trong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/he-gia-dinh-noi-phan-xa-duoc-hoc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/hieu-cuoc-doi-minh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/hoc-tap-sang-tao-truong-thanh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/hoi-sinh-su-song-tu-su-sang-tao-nguyen-so/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/im-lang-noi-ban-van-dang-ne/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/ket-noi-linh-hon-vat-the/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/ket-noi-sang-tao/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/khi-moi-truong-khong-con-phu-hop/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/khoi-tu-tam/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/kien-tao-mot-doi-song-y-nghia/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/lao-dong-sang-tao-khong-phai-dau-ra-ma-la-cach-song/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/lao-dong-sang-tao/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/minh-dang-di-con-duong-gi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/moi-truong-la-nguoi-thay-vo-hinh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/mon-hoc-don-dep-tong-quan/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/mon-hoc-don-dep/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/neu-minh-sai-thi-sao/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/ngoi-nha-thu-2/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/ngoi-nha-thu-hai-noi-ban-dang-song-moi-ngay/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/nhat-ky-37-ngay-lam-chu-ngay-1/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/nhung-vong-lap-ban-chua-goi-ten/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/nuoi-day-tre-khong-lam-gay-tu-nhien/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /bai-viet/quet-la-va-viec-hoc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/sai-moi-truong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/song-sai-nhip/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/song-theo-dong-chay/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/song-theo-thoi-quen/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/thieu-su-that/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/truong-thanh-thong-qua-mon-hoc-don-dep/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/tu-55-trieu-den-tu-do/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /bai-viet/vu-tru-vat-chat/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /chinh-sach-bao-mat/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /chuong-trinh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /dieu-khoan/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /du-an/du-an-37-ngay/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /du-an/du-an-buoc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /du-an/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/admin/content/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/admin/creators/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/admin/dashboard/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/admin/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | EDITORIAL_REVIEW_OPTIONAL |
| /en/admin/members/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/admin/payments/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | EDITORIAL_REVIEW_OPTIONAL |
| /en/admin/settings/ | admin | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/bai-viet/am-thanh-tu-than-khi-mot-tieng-hat-tro-thanh-cach-tro-ve/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/ban-khong-thieu-kien-thuc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/bon-truc-thay-doi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/cai-choi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/chi-can-dung/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/chua-tung-co-huong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/co-don-khong-phai-vi-thieu-nguoi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/co-nguoi-can-dung-lai/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/cong-dong-song-moi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/dau-tu-ban-than-hoc-tap-nhan-thuc-cao-hon/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/dau-tu-ban-than-khong-ao-tuong-doi-doi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/dau-tu-ban-than/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/dau-tu-hien-tai-tu-do-tuong-lai/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/di-vao-ben-trong-giai-ma-nhung-gi-dang-van-hanh-ban/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/di-vao-ben-trong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/dieu-ban-dang-tranh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/dieu-tre-em-can-khong-chi-la-day-dung/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/dong-chay-sang-tao-dong-chay-su-song/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/du-an-37-ngay/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/du-an-buoc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/du-an-nhat-ky/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/gan-duc-khoi-trong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/gia-dinh-khong-chi-la-noi-ta-lon-len/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/gia-tri-cuoc-doi-ban-dang-gia-bao-nhieu/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/gia-tri-nao-la-vinh-cuu-truoc-song-gio/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/gia-tri-noi-tai/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/hanh-trinh-di-vao-ben-trong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/he-gia-dinh-noi-phan-xa-duoc-hoc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/hieu-cuoc-doi-minh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/hoc-tap-sang-tao-truong-thanh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/hoi-sinh-su-song-tu-su-sang-tao-nguyen-so/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/im-lang-noi-ban-van-dang-ne/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/ket-noi-linh-hon-vat-the/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/ket-noi-sang-tao/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/khi-moi-truong-khong-con-phu-hop/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/khoi-tu-tam/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/kien-tao-mot-doi-song-y-nghia/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/lao-dong-sang-tao-khong-phai-dau-ra-ma-la-cach-song/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/lao-dong-sang-tao/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/minh-dang-di-con-duong-gi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/moi-truong-la-nguoi-thay-vo-hinh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/mon-hoc-don-dep-tong-quan/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/mon-hoc-don-dep/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/neu-minh-sai-thi-sao/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/ngoi-nha-thu-2/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/ngoi-nha-thu-hai-noi-ban-dang-song-moi-ngay/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/nhat-ky-37-ngay-lam-chu-ngay-1/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/nhung-vong-lap-ban-chua-goi-ten/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/nuoi-day-tre-khong-lam-gay-tu-nhien/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bai-viet/quet-la-va-viec-hoc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/sai-moi-truong/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/song-sai-nhip/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/song-theo-dong-chay/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/song-theo-thoi-quen/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/thieu-su-that/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/truong-thanh-thong-qua-mon-hoc-don-dep/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/tu-55-trieu-den-tu-do/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bai-viet/vu-tru-vat-chat/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/bat-dau/7-ngay-thiet-lap-nhip-song-moi/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bat-dau/bat-dau-trong-15-phut/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bat-dau/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/bat-dau/vi-sao-day-la-mot-he-thuc-hanh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/chinh-sach-bao-mat/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/chuong-trinh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/dieu-khoan/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/du-an/du-an-37-ngay/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/du-an/du-an-buoc/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/du-an/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/faq/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/gioi-thieu/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /en/hanh-trinh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/join/cancel/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | EDITORIAL_REVIEW_OPTIONAL |
| /en/join/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/join/retry/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/join/success/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | EDITORIAL_REVIEW_OPTIONAL |
| /en/lien-he/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/members/circle/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/creator/guidelines/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/creator/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/creator/library/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/creator/revenue-share/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/creator/submit/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/dashboard/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/am-thanh-tu-than/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/ban-do-vong-lap/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/doi-thoai-chua-lanh-trong-nha/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/gia-dinh-va-goc-re/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/ky-luat-nhe-va-nhip-song-moi/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/lao-dong-vat-the-va-su-truong-thanh/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/moi-truong-song-nhu-mot-than-the-thu-hai/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/ranh-gioi-mem-trong-gia-dinh/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/tre-em-va-khong-gian-lon-len/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/deep/tre-em-va-nhip-song-so/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/experience/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /en/members/journey/day-1/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/journey/day-2/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/journey/day-7/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/journey/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/pilot/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/practice/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | EDITORIAL_REVIEW_OPTIONAL |
| /en/members/pro/creation/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/pro/discipline/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/pro/environment/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/pro/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/pro/inner/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/pro/reset/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/pro/wealth/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/members/start/ | members | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/mien-tru-trach-nhiem/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | NOINDEX | NONE |
| /en/phuong-phap/ | public | PASS | PASS | PASS | PASS | PASS | PASS | en-US | INDEXABLE | NONE |
| /faq/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /gioi-thieu/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /hanh-trinh/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| / | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | EDITORIAL_REVIEW_OPTIONAL |
| /join/cancel/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | EDITORIAL_REVIEW_OPTIONAL |
| /join/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /join/retry/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /join/success/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | EDITORIAL_REVIEW_OPTIONAL |
| /lien-he/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /members/circle/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/creator/guidelines/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | EDITORIAL_REVIEW_OPTIONAL |
| /members/creator/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/creator/library/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/creator/revenue-share/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/creator/submit/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/dashboard/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/am-thanh-tu-than/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/ban-do-vong-lap/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/doi-thoai-chua-lanh-trong-nha/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/gia-dinh-va-goc-re/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/ky-luat-nhe-va-nhip-song-moi/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/lao-dong-vat-the-va-su-truong-thanh/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/moi-truong-song-nhu-mot-than-the-thu-hai/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/ranh-gioi-mem-trong-gia-dinh/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/tre-em-va-khong-gian-lon-len/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/deep/tre-em-va-nhip-song-so/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/experience/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
| /members/journey/day-1/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/journey/day-2/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/journey/day-7/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/journey/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/pilot/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/practice/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | EDITORIAL_REVIEW_OPTIONAL |
| /members/pro/creation/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/pro/discipline/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/pro/environment/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/pro/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/pro/inner/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/pro/reset/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/pro/wealth/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /members/start/ | members | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /mien-tru-trach-nhiem/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | NOINDEX | NONE |
| /phuong-phap/ | public | PASS | PASS | PASS | PASS | PASS | PASS | vi | INDEXABLE | NONE |
