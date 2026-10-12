X-ON

# **Technical & Functional** **Specification**

Website demo scope · Customer-facing \+ Admin

| Reference website | [https\://lalafolie.us/](https://lalafolie.us/) |
| :---- | :---- |
| **Verified structure** | 23 Sep 2026 |
| **Document purpose** | Demo / proposal / UI-UX & development handoff |
| **Project brand** | X-ON |
| **Brand line** | Press On. Slay On. Repeat. |
| **Address** | 3168 Bill Beck Blvd, Kissimmee, FL 34744 |
| **Phone** | 689-212-8888 |

**Scope baseline**

14 customer-facing page templates \+ 6 admin page templates. CRUD actions in admin are handled inside the same management screen via modal, drawer, or confirmation popup; Add/Edit/Delete are not separate page templates.

# **1\. Mục tiêu tài liệu**

Tài liệu này mô tả phạm vi kỹ thuật và chức năng cho bản demo website X-ON. Cấu trúc frontend được đối chiếu từ website tham khảo công khai https\://lalafolie.us/, trong khi toàn bộ branding, nội dung doanh nghiệp và thông tin liên hệ được áp dụng cho X-ON. Admin là phần đề xuất để chứng minh khả năng quản trị dữ liệu và CRUD cho khách hàng.

## **1.0A Thông tin thương hiệu X-ON**

X-ON is where modern nail artistry meets effortless beauty.

Created for nail lovers and professionals alike, X-ON offers handmade press-on nails and carefully selected nail essentials designed with quality, style, and performance in mind.

From statement-making nail sets to everyday professional supplies, every X-ON product is chosen to make beautiful nails easier, faster, and more accessible—without compromising on a polished, luxury finish.

X-ON — Press On. Slay On. Repeat.

Địa chỉ: 3168 Bill Beck Blvd, Kissimmee, FL 34744

Số điện thoại: 689-212-8888

| Nguồn tham khảo cấu trúc/UI chính: https\://lalafolie.us/. Đây là website tham khảo, không phải thương hiệu của dự án. Brand/content áp dụng cho X-ON: handmade press-on nails & selected nail essentials; address 3168 Bill Beck Blvd, Kissimmee, FL 34744; phone 689-212-8888. Website live có thể thay đổi theo thời gian; khi triển khai production cần đối chiếu lại cấu trúc tham khảo. |
| :---- |

## **1.1 Phạm vi demo**

| Khu vực | Số khung | Mục tiêu |
| :---- | :---- | :---- |
| Customer-facing | 14 | Thể hiện đầy đủ các loại trang/khung đang có trên website tham khảo. |
| Admin | 6 | Thể hiện quản trị sản phẩm, nội dung, blog/gallery, user/wholesale và đơn hàng. |
| Tổng | 20 | Tính theo page template; modal/drawer/popup không tính là trang riêng. |

## **1.2 Vai trò người dùng**

* Guest: xem nội dung, shop, sản phẩm, gallery, blog, gửi contact/wholesale form.  
* Registered Customer: đăng nhập/đăng ký tài khoản và sử dụng các chức năng tài khoản khi được triển khai.  
* Wholesale Applicant / Customer: gửi thông tin đăng ký wholesale.  
* Admin: quản lý dữ liệu hiển thị trên frontend, sử dụng CRUD trong các màn quản trị.

# **2\. Information Architecture \- Frontend**

Menu và các page type dưới đây bám theo cấu trúc công khai của website tham khảo Lalafolie (https\://lalafolie.us/). Nội dung hiển thị, thương hiệu và thông tin doanh nghiệp được chuyển sang X-ON. Product category và design theme dùng chung template Shop/Collection thay vì tách thành nhiều khung design.

| \# | Page template | Reference URL | Section chính |
| :---- | :---- | :---- | :---- |
| 1 | Home | [lalafolie.us](https://lalafolie.us/) | Handmade Press-On Nails; Nail Essentials; Best Sellers; Our Reviews; Find Us; X-ON Newsletter / Updates; Footer. |
| 2 | Shop / Collection | [/shop/](https://lalafolie.us/shop/) | Search; price filter; shape filters; X-ON product type filters; product grid; pagination; X-ON Newsletter / Updates; Footer. |
| 3 | Product Detail | [Sample product](https://lalafolie.us/product/cf-35-0961/) | Product info; price; size; quantity; Add to cart; SKU/categories; Additional information; Reviews; related products. |
| 4 | About | [/about/](https://lalafolie.us/about/) | X-ON — Press On. Slay On. Repeat; modern nail artistry; brand story; X-ON Newsletter / Updates; Footer. |
| 5 | Wholesale Signup | [/wholesale-signup/](https://lalafolie.us/wholesale-signup/) | Hero/image; Register form; membership; submit; X-ON Newsletter / Updates; Footer. |
| 6 | Bundle & Save | [/bundle-and-save/](https://lalafolie.us/bundle-and-save/) | Bundle title; discount cards; price; Add to cart / Select options; X-ON Newsletter / Updates; Footer. |
| 7 | Sizing Chart | [/sizing-chart/](https://lalafolie.us/sizing-chart/) | Intro; Size; Nail Shapes & Length; Length Details; X-ON Newsletter / Updates; Footer. |
| 8 | Gallery Product | [/gallery-product/](https://lalafolie.us/gallery-product/) | Now Selling; Product Gallery; Shop now; size labels; gallery grid; pagination; X-ON Newsletter / Updates; Footer. |
| 9 | Gallery Coming Soon | [/gallery-coming-soon/](https://lalafolie.us/gallery-coming-soon/) | Upcoming/seasonal collections; featured/new collection; X-ON Newsletter / Updates; Footer. |
| 10 | Blog | [/blog/](https://lalafolie.us/blog/) | News; article cards/list; title; date; Read more; X-ON Newsletter / Updates; Footer. |
| 11 | Blog Detail | [Sample article](https://lalafolie.us/extra-long-handmade-nail-luxury/) | Article title; dynamic content sections; comment form; X-ON Newsletter / Updates; Footer. |
| 12 | Contact Us | [/contact-us/](https://lalafolie.us/contact-us/) | X-ON brand/contact hero; handmade press-on nails; nail essentials; brand benefits; address & phone; Contact X-ON form; X-ON Newsletter / Updates; Footer. |
| 13 | My Account | [/my-account/](https://lalafolie.us/my-account/) | Login; Lost password; Register; privacy notice; X-ON Newsletter / Updates; Footer. |
| 14 | Legal / Content Page | [Reference home/footer](https://lalafolie.us/) | Page title; rich text content; X-ON Newsletter / Updates; Footer. Reusable for Terms / Privacy. |

# **3\. Component dùng chung**

| Component | Yêu cầu |
| :---- | :---- |
| Header / Navigation | Logo; Home; Shop; mega/dropdown cho Product Type & Design Theme; About; Wholesale Signup; Bundle and Save; Sizing Chart; Gallery; Blog; Contact; Login; mobile menu. |
| Product Card | Ảnh; tên; giá; sale badge nếu có; size/variant indicator; CTA Select options/Add to cart; trạng thái stock khi cần. |
| X-ON Newsletter / Updates | Email; phone (optional); consent text; Terms & Privacy links; submit state/success/error. Naming/content can be finalized with X-ON brand direction. |
| Footer | Brand links; Social; address 3168 Bill Beck Blvd, Kissimmee, FL 34744; phone 689-212-8888; copyright. |
| Form Controls | Input, select, textarea, checkbox, validation message, loading/success/error state. |
| Pagination | Dùng cho Shop và Gallery Product; giữ filter/query khi chuyển trang nếu có. |
| Modal / Drawer / Popup | Dùng cho admin Add/Edit, detail nhanh, confirm delete; không tính thành page template riêng. |

# **4\. Đặc tả chi tiết Customer-facing**

## **4.1 Home**

Reference: [https\://lalafolie.us/](https://lalafolie.us/)

* Handmade Press-On Nails: danh sách các bộ press-on nails thủ công nổi bật, ưu tiên hình ảnh, tên sản phẩm, giá và size/variant khi áp dụng.  
* Nail Essentials: nhóm các sản phẩm nail essentials được X-ON lựa chọn cho người yêu nail và nail professionals, tập trung vào chất lượng, phong cách và hiệu năng.  
* Best Sellers: sản phẩm/bundle nổi bật; hiển thị sale badge, giá gốc và giá sale khi có.  
* Our Reviews: khu vực social proof/review.  
* Find Us: CTA/location block hiển thị địa chỉ X-ON — 3168 Bill Beck Blvd, Kissimmee, FL 34744\.  
* X-ON Newsletter / Updates \+ Footer dùng chung.

| Admin mapping: Products, Website Content, Blog & Gallery (nếu review/gallery quản trị), Settings/links nếu mở rộng. |
| :---- |

## **4.2 Shop / Collection**

Reference: [https\://lalafolie.us/shop/](https://lalafolie.us/shop/)

* Search sản phẩm.  
* Filter by price (min/max).  
* Shape filters: Almond, Coffin, Oval, Round, Square, Stiletto.  
* Product Type filters: Best Sellers, Handmade Press-On Nails, Nail Essentials; taxonomy có thể mở rộng khi X-ON cung cấp catalog chính thức.  
* Product grid với variant CTA.  
* Pagination.  
* Category/Design Theme pages reuse cùng template.

| Không tạo layout riêng cho từng category; chỉ thay data/filter context. |
| :---- |

## **4.3 Product Detail**

Reference: [https\://lalafolie.us/product/cf-35-0961/](https://lalafolie.us/product/cf-35-0961/)

* Product title, price và image/gallery.  
* Size selector (ví dụ S/M/L/XL).  
* Quantity \+ Add to cart.  
* SKU \+ Categories.  
* Tabs/sections Additional information và Reviews.  
* Review form: rating, review, name, email.  
* Related/recommended products.  
* X-ON Newsletter / Updates \+ Footer.

| Dữ liệu phải bind trực tiếp từ Product entity do admin quản lý. |
| :---- |

## **4.4 About**

Reference: [https\://lalafolie.us/about/](https://lalafolie.us/about/)

* X-ON — Press On. Slay On. Repeat.  
* X-ON is where modern nail artistry meets effortless beauty.  
* Brand description: Created for nail lovers and professionals alike, X-ON offers handmade press-on nails and carefully selected nail essentials designed with quality, style, and performance in mind. From statement-making nail sets to everyday professional supplies, every X-ON product is chosen to make beautiful nails easier, faster, and more accessible—without compromising on a polished, luxury finish.  
* X-ON Newsletter / Updates \+ Footer.

| Nội dung text/image nên editable trong Website Content admin. |
| :---- |

## **4.5 Wholesale Signup**

Reference: [https\://lalafolie.us/wholesale-signup/](https://lalafolie.us/wholesale-signup/)

* Hero/Image.  
* Register heading \+ description.  
* Username, email, business name, business address, phone.  
* Password \+ confirm password.  
* Membership Field: Wholesale customer.  
* Submit.  
* X-ON Newsletter / Updates \+ Footer.

| Submit tạo WholesaleApplication/User record; admin có thể xem và cập nhật trạng thái. |
| :---- |

## **4.6 Bundle & Save**

Reference: [https\://lalafolie.us/bundle-and-save/](https://lalafolie.us/bundle-and-save/)

* Bundle and Save title.  
* Bundle/product cards.  
* Discount percentage badge.  
* Original price \+ sale price.  
* Add to cart hoặc Select options.  
* X-ON Newsletter / Updates \+ Footer.

| Bundle vẫn dùng Product data; có thể đánh dấu product\_type/bundle flag trong admin. |
| :---- |

## **4.7 Sizing Chart**

Reference: [https\://lalafolie.us/sizing-chart/](https://lalafolie.us/sizing-chart/)

* Hero/Image.  
* Sizing Chart introduction.  
* Tabs/anchors: Size; Nail Shapes & Length; Length Details.  
* Size mapping: Thumb-Index-Middle-Ring-Pinky.  
* XS/S/M/L/Custom rows.  
* Nail Shapes & Length image/content.  
* Length Details image/content.  
* X-ON Newsletter / Updates \+ Footer.

| Trang dạng managed content; không cần data model riêng nếu không có yêu cầu dynamic phức tạp. |
| :---- |

## **4.8 Gallery Product**

Reference: [https\://lalafolie.us/gallery-product/](https://lalafolie.us/gallery-product/)

* Hero/Image.  
* Now Selling.  
* Product Gallery intro.  
* Shop now CTA.  
* Gallery/product visual grid.  
* Size labels S/M/L.  
* Pagination.  
* X-ON Newsletter / Updates \+ Footer.

| Gallery item có thể liên kết Product để CTA sang Product Detail/Shop. |
| :---- |

## **4.9 Gallery Coming Soon**

Reference: [https\://lalafolie.us/gallery-coming-soon/](https://lalafolie.us/gallery-coming-soon/)

* Upcoming/Seasonal Collection 01 (tên collection do X-ON cấu hình).  
* Upcoming/Seasonal Collection 02 (tên collection do X-ON cấu hình).  
* Upcoming/Seasonal Collection 03 (tên collection do X-ON cấu hình).  
* Featured / New Collection (tên collection do X-ON cấu hình).  
* X-ON Newsletter / Updates \+ Footer.

| Admin cần bật/tắt collection và quản lý ảnh/thứ tự hiển thị. |
| :---- |

## **4.10 Blog**

Reference: [https\://lalafolie.us/blog/](https://lalafolie.us/blog/)

* Hero/Image.  
* News heading.  
* Article cards/list.  
* Title.  
* Publish date.  
* Read more CTA.  
* X-ON Newsletter / Updates \+ Footer.

| Danh sách lấy từ BlogPost entity; sort mặc định newest first. |
| :---- |

## **4.11 Blog Detail**

Reference: [https\://lalafolie.us/extra-long-handmade-nail-luxury/](https://lalafolie.us/extra-long-handmade-nail-luxury/)

* Article title.  
* Các content section động (heading, paragraph, image, list).  
* Ví dụ content direction cho X-ON: modern nail artistry; handmade press-on nails; statement-making nail sets; professional nail essentials; quality, style & performance; easier, faster, more accessible beauty; polished luxury finish.  
* Comment form.  
* X-ON Newsletter / Updates \+ Footer.

| Không hard-code tên section của từng bài; editor admin phải hỗ trợ rich text/content blocks. |
| :---- |

## **4.12 Contact Us**

Reference: [https\://lalafolie.us/contact-us/](https://lalafolie.us/contact-us/)

* X-ON — handmade press-on nails & carefully selected nail essentials.  
* Brand intro: X-ON is where modern nail artistry meets effortless beauty.  
* Handmade Press-On Nails benefit block.  
* Nail Essentials benefit block.  
* Quality, style & performance; designed for nail lovers and professionals; easier, faster and more accessible beauty.  
* Contact / Wholesale CTA \+ phone: 689-212-8888.  
* Location/trust block: 3168 Bill Beck Blvd, Kissimmee, FL 34744; polished, luxury-finish positioning.  
* Contact X-ON form: First & Last Name, Email Address, Phone/Order Number (khi áp dụng), message và submit control.  
* X-ON Newsletter / Updates \+ Footer.

| Form submit tạo Inquiry record trong admin; cần validation \+ trạng thái gửi thành công/thất bại. |
| :---- |

## **4.13 My Account**

Reference: [https\://lalafolie.us/my-account/](https://lalafolie.us/my-account/)

* Login: username/email, password, Remember me.  
* Lost your password.  
* Register: email.  
* Privacy notice.  
* X-ON Newsletter / Updates \+ Footer.

| Demo có thể dùng mock auth; production cần authentication/session/reset-password thực tế. |
| :---- |

## **4.14 Legal / Content Page**

Reference: [https\://lalafolie.us/](https://lalafolie.us/)

* Page title.  
* Rich text body.  
* Internal/external links.  
* X-ON Newsletter / Updates \+ Footer.

| Reusable template cho Terms, Privacy Policy hoặc các trang text-only khác. |
| :---- |

# **5\. Information Architecture \- Admin**

Admin dưới đây là phần đề xuất cho demo. Mục tiêu là cho khách thấy dữ liệu trên website có thể được thêm, sửa, xóa và quản lý tập trung. Add/Edit/Delete không tạo trang riêng.

| \# | Admin page | Sections / functions |
| :---- | :---- | :---- |
| 1 | Dashboard | KPI cards; Products; Orders; Customers; Wholesale; Recent Orders; Recent Inquiries; Quick Actions. |
| 2 | Products | Toolbar; Search; filters; product table/grid; Add/Edit modal or drawer; Delete confirmation; bulk/status actions nếu cần. |
| 3 | Orders | Summary; Search; status filter; order list; Order Detail drawer/modal; status update. |
| 4 | Website Content | Page/section list; Home; About; Bundle; Sizing; Contact; edit content/image/CTA/visibility. |
| 5 | Blog & Gallery | Tabs Blog / Product Gallery / Coming Soon; add/edit content; media; publish/status; sort/order; delete confirmation. |
| 6 | Users / Wholesale / Inquiries | Tabs Customers / Wholesale / Contact Inquiries; search/filter; detail drawer; status/notes. |

## **5.1 Dashboard**

* KPI overview: total products, active products, orders, customers, wholesale applications, inquiries.  
* Recent Orders table (nếu Order module được bật).  
* Recent Wholesale Applications / Contact Inquiries.  
* Quick Actions: Add Product, Add Blog Post, Add Gallery Item, Edit Home Content.

## **5.2 Products**

* Product list/table: thumbnail, name/SKU, price, category/type, stock/status, updated date, actions.  
* Search \+ filters: product type/category/status; có thể thêm shape/theme.  
* Add Product: mở modal/drawer trên cùng màn hình.  
* Edit Product: mở cùng form với dữ liệu pre-filled.  
* Delete Product: confirmation popup; không xóa ngay bằng một click.  
* Các field tối thiểu: name, SKU, images, regular price, sale price, sizes/variants, category/type/theme, stock/status, description/additional info.

## **5.3 Orders**

* Order list: order ID, customer, total, payment/status, created date, action.  
* Search \+ status filters.  
* Order Detail drawer/modal: customer, line items, subtotal/total, shipping/billing fields nếu có, payment reference nếu có.  
* Update order status trong detail view hoặc inline action.

## **5.4 Website Content**

* Danh sách các managed pages/sections thay vì sửa trực tiếp code.  
* Home: section visibility, headings, selected products, CTA/link.  
* About: title/subtitle/body/image.  
* Bundle/Sizing/Contact: text blocks, images, CTA, section order/visibility ở mức cần thiết cho demo.  
* Save/Publish action \+ success/error state.

## **5.5 Blog & Gallery**

* Tabs: Blog, Product Gallery, Coming Soon Collections.  
* Blog CRUD: title, slug (auto/manual), cover image, publish date, content blocks/rich text, status.  
* Gallery CRUD: title/collection, media, linked product (optional), size labels, publish/status, sort order.  
* Delete qua confirmation popup.

## **5.6 Users / Wholesale / Inquiries**

* Customers: basic profile \+ account status.  
* Wholesale: username/email/business name/address/phone/membership/status/notes.  
* Contact Inquiries: name, email, order number, message, status, admin note.  
* Detail dùng drawer/modal; update status/notes không cần page riêng.

# **6\. Chuẩn tương tác CRUD trong Admin**

| Action | UI pattern | Expected behavior |
| :---- | :---- | :---- |
| Add | Modal hoặc right-side drawer | Mở form rỗng; validate; Save; toast/success message; list cập nhật sau khi lưu. |
| Edit | Cùng modal/drawer với Add | Pre-fill dữ liệu hiện tại; Save changes; refresh row/card tương ứng. |
| Delete | Confirmation popup | Hiển thị tên record; Cancel/Delete; chỉ xóa sau confirm; ưu tiên soft-delete/archive nếu production cần audit. |
| View Detail | Drawer / modal | Dùng cho Order, Wholesale, Inquiry khi chỉ cần xem \+ chỉnh trạng thái/notes. |
| Search / Filter | Toolbar trên list | Không tạo page riêng; query state nên giữ khi edit xong/quay lại list. |

| Nguyên tắc demo: mỗi entity quản lý trong một màn list chính. CRUD chỉ là state của màn đó, không nhân số lượng page template. |
| :---- |

# **7\. Data model tối thiểu**

| Entity | Field/relationship chính | Frontend/Admin mapping |
| :---- | :---- | :---- |
| Product | id, name, slug, SKU, images, price, sale\_price, sizes/variants, stock/status, product\_type, categories/themes, description, additional\_info | Home, Shop, Product Detail, Bundle, Gallery / Admin Products |
| Category / Taxonomy | id, name, slug, type (shape/theme/product type), status, sort\_order | Shop filters/menu / Admin Products taxonomy |
| PageContent | page\_key, section\_key, heading, body, media, CTA, visibility, sort\_order | Home/About/Sizing/Contact/Legal / Admin Website Content |
| BlogPost | title, slug, cover, publish\_date, content, status | Blog \+ Blog Detail / Admin Blog |
| GalleryItem / Collection | title, media, collection, linked\_product, size\_labels, status, sort\_order | Gallery pages / Admin Gallery |
| User | email/username, password hash/auth provider, role, status | My Account / Admin Users |
| WholesaleApplication | user/contact fields, business fields, membership, status, notes | Wholesale Signup / Admin Wholesale |
| Inquiry | name, email, order\_number, message, status, note, created\_at | Contact Us / Admin Inquiries |
| Order | order\_id, customer, line\_items, totals, status, payment/shipping metadata | Admin Orders; storefront order flow only if enabled. |

# **8\. Luồng chức năng chính**

| Flow | Sequence |
| :---- | :---- |
| Browse & discover | Home → Shop/Collection → Filter/Search → Product Detail. |
| Product selection | Product Detail → choose size/variant → quantity → Add to cart. Reference site hiện có CTA Add to cart; full Cart/Checkout flow không được tính trong base page scope của tài liệu này. |
| Wholesale | Wholesale Signup → validate → submit → create application → Admin Users/Wholesale → status/notes. |
| Contact | Contact Us → validate → submit → create inquiry → Admin Inquiries → status/notes. |
| Content publishing | Admin Website Content/Blog/Gallery → edit/save/publish → corresponding frontend sections update. |
| Product CRUD | Admin Products → Add/Edit/Delete modal → product data reflected on Home/Shop/Product/Bundle/Gallery where linked. |

# **9\. Responsive & UI behavior**

* Desktop: giữ hierarchy và grid phù hợp với retail/e-commerce; navigation đầy đủ.  
* Tablet: product/gallery grid giảm số cột; filter có thể chuyển sang drawer.  
* Mobile: menu dạng drawer/hamburger; product grid 1-2 cột tùy kích thước; form full-width; bảng admin ưu tiên horizontal scroll hoặc card/list responsive.  
* Buttons và form controls phải có hover/focus/disabled/loading/error/success states.  
* Ảnh sản phẩm dùng aspect ratio nhất quán và object-fit phù hợp; không để layout shift khi ảnh tải.  
* Modal/drawer phải có close action, ESC/backdrop behavior hợp lý và focus management khi production.

# **10\. Yêu cầu kỹ thuật phi chức năng**

| Hạng mục | Yêu cầu |
| :---- | :---- |
| Performance | Optimize image (WebP/AVIF khi phù hợp), lazy-load media dưới fold, cache static assets, hạn chế JS không cần thiết, pagination/server query hiệu quả. |
| SEO | Semantic headings, unique title/meta per page, clean slug, canonical cho list/category khi cần, alt text cho ảnh, structured data Product/Article nếu production. |
| Accessibility | Keyboard navigation, visible focus, label cho form, error text rõ ràng, contrast đủ dùng, alt text cho meaningful images. |
| Security | Server-side validation; sanitize rich text; secure auth/session; role-based admin access; CSRF protection; rate limiting cho login/contact nếu production. |
| Data integrity | Unique SKU/slug khi cần; validation price/stock; confirm delete; audit/soft delete có thể bổ sung ở production. |
| Media | Upload validation theo MIME/size; image resize/compression; tránh upload ảnh quá lớn gây chậm site. |
| Browser | Responsive trên Chrome/Edge/Safari/Firefox bản hiện hành; ưu tiên iOS Safari và Android Chrome cho mobile. |

# **11\. Acceptance Criteria cho bản demo**

* 20 page templates trong scope được thể hiện theo IA của tài liệu hoặc có ghi chú rõ nếu intentionally omitted.  
* Frontend Home/Shop/Product Detail là 3 màn trọng tâm và phải thể hiện đúng hierarchy nội dung của website tham khảo.  
* Các section chính trên từng frontend page khớp website tham khảo tại thời điểm kiểm tra 23 Sep 2026\.  
* Admin Products thể hiện được đầy đủ Add/Edit/Delete trong cùng một page bằng modal/drawer/popup.  
* Ít nhất Product data phải có liên kết trực quan giữa Admin Products và frontend Shop/Product Detail trong demo.  
* Wholesale Signup và Contact Us submit có validation và trạng thái success/error trong prototype hoặc implementation.  
* Layout responsive ở desktop \+ mobile; không overflow text/table/form.  
* Không bắt buộc payment gateway hoặc checkout production trong base demo scope.

# **12\. Phần mở rộng / ngoài base scope**

Các hạng mục sau có thể thêm nếu khách yêu cầu sau khi duyệt demo. Chúng không được tính vào 20 khung base ở trên:

* Cart page.  
* Checkout page.  
* Payment gateway integration (Stripe/PayPal/Apple Pay/Google Pay tùy yêu cầu và quốc gia).  
* Order Success / Thank-you page.  
* Full customer account dashboard: orders, addresses, saved payment, profile.  
* Advanced inventory, coupon/discount engine, shipping rules, tax, email automation.  
* Analytics dashboard nâng cao và role/permission chi tiết.

| Lưu ý: website tham khảo có nút “View Cart” và CTA Add to cart, nhưng tài liệu base này chỉ cam kết các page type đã được xác minh và scope demo đã chốt. Cart/Checkout nên được coi là phase mở rộng nếu cần trình diễn flow mua hàng hoàn chỉnh. |
| :---- |

# **13\. Reference links**

**Main website:** [https\://lalafolie.us/](https://lalafolie.us/)

**Shop:** [https\://lalafolie.us/shop/](https://lalafolie.us/shop/)

**Product detail sample:** [https\://lalafolie.us/product/cf-35-0961/](https://lalafolie.us/product/cf-35-0961/)

**About:** [https\://lalafolie.us/about/](https://lalafolie.us/about/)

**Wholesale Signup:** [https\://lalafolie.us/wholesale-signup/](https://lalafolie.us/wholesale-signup/)

**Bundle and Save:** [https\://lalafolie.us/bundle-and-save/](https://lalafolie.us/bundle-and-save/)

**Sizing Chart:** [https\://lalafolie.us/sizing-chart/](https://lalafolie.us/sizing-chart/)

**Gallery Product:** [https\://lalafolie.us/gallery-product/](https://lalafolie.us/gallery-product/)

**Gallery Coming Soon:** [https\://lalafolie.us/gallery-coming-soon/](https://lalafolie.us/gallery-coming-soon/)

**Blog:** [https\://lalafolie.us/blog/](https://lalafolie.us/blog/)

**Blog detail sample:** [https\://lalafolie.us/extra-long-handmade-nail-luxury/](https://lalafolie.us/extra-long-handmade-nail-luxury/)

**Contact Us:** [https\://lalafolie.us/contact-us/](https://lalafolie.us/contact-us/)

**My Account:** [https\://lalafolie.us/my-account/](https://lalafolie.us/my-account/)

**End of specification**