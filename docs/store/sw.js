var U={"/repo/theme/config/settings_data.json":`{
  "current": "Default",
  "presets": {
    "Default": {
      "wordmark": "racik",
      "color_paper": "#FBFAF6",
      "color_ink": "#17261C",
      "color_muted": "#4C5A50",
      "color_line": "#E2DFD3",
      "color_leaf": "#2E5B39",
      "pack_tiers": "3:10, 5:15",
      "subscribe_badge": "Save 15%",
      "consent_banner": true
    }
  }
}
`,"/repo/theme/config/settings_schema.json":`[
  {
    "name": "theme_info",
    "theme_name": "Racik",
    "theme_version": "1.0.0",
    "theme_author": "Yodhimas Geffananda",
    "theme_documentation_url": "https://github.com/geffaa/racik-shopify",
    "theme_support_url": "https://github.com/geffaa/racik-shopify"
  },
  {
    "name": "Brand",
    "settings": [
      { "type": "text", "id": "wordmark", "label": "Wordmark", "default": "racik" },
      { "type": "image_picker", "id": "logo", "label": "Logo image" },
      { "type": "image_picker", "id": "favicon", "label": "Favicon" }
    ]
  },
  {
    "name": "Colors",
    "settings": [
      {
        "type": "paragraph",
        "content": "Each tonic brings its own colour through the racik.color metafield. These are the neutrals around them."
      },
      { "type": "color", "id": "color_paper", "label": "Paper", "default": "#FBFAF6" },
      { "type": "color", "id": "color_ink", "label": "Ink", "default": "#17261C" },
      { "type": "color", "id": "color_muted", "label": "Muted text", "default": "#4C5A50" },
      { "type": "color", "id": "color_line", "label": "Lines", "default": "#E2DFD3" },
      { "type": "color", "id": "color_leaf", "label": "Brand accent", "default": "#2E5B39" }
    ]
  },
  {
    "name": "Subscriptions & packs",
    "settings": [
      {
        "type": "text",
        "id": "pack_tiers",
        "label": "Pack discount tiers",
        "default": "3:10, 5:15",
        "info": "minimum tonics:percent off. Display only: keep in sync with the pack-discount function configuration."
      },
      {
        "type": "text",
        "id": "subscribe_badge",
        "label": "Subscription badge",
        "default": "Save 15%"
      }
    ]
  },
  {
    "name": "Shipping by market",
    "settings": [
      {
        "type": "textarea",
        "id": "free_shipping_thresholds",
        "label": "Free shipping thresholds",
        "default": "USD:50\\nCAD:65\\nEUR:50\\nGBP:45\\nAUD:80",
        "info": "One per line, CURRENCY:amount in that currency. The bar hides for currencies not listed."
      },
      {
        "type": "textarea",
        "id": "delivery_estimates",
        "label": "Delivery estimates",
        "default": "US:3\u20135 business days\\nCA:5\u20138 business days\\nGB:4\u20137 business days\\nAU:6\u201310 business days\\nDE:5\u20138 business days\\nFR:5\u20138 business days\\nNL:5\u20138 business days",
        "info": "One per line, COUNTRY_CODE:text."
      },
      {
        "type": "text",
        "id": "duties_note",
        "label": "Duties note (outside US)",
        "default": "Duties and import taxes are calculated and paid at checkout. No surprise fees on delivery."
      }
    ]
  },
  {
    "name": "Privacy",
    "settings": [
      {
        "type": "checkbox",
        "id": "consent_banner",
        "label": "Show cookie consent banner",
        "default": true,
        "info": "Uses Shopify's Customer Privacy API. Shown only where Shopify says consent is required."
      }
    ]
  }
]
`,"/repo/theme/layout/theme.liquid":`<!doctype html>
<html lang="{{ request.locale.iso_code }}" class="no-js">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="{{ settings.color_paper }}">
    <link rel="canonical" href="{{ canonical_url }}">
    {{ 'bricolage-var.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}
    {%- if settings.favicon != blank -%}
      <link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 64, height: 64 }}">
    {%- endif -%}

    <title>
      {{- page_title -}}
      {%- unless page_title contains shop.name %} | {{ shop.name }}{% endunless -%}
    </title>
    {%- if page_description -%}
      <meta name="description" content="{{ page_description | escape }}">
    {%- endif -%}
    {%- render 'meta-tags' -%}
    {%- render 'theme-tokens' -%}
    {{ 'base.css' | asset_url | stylesheet_tag }}

    <script>document.documentElement.className = document.documentElement.className.replace('no-js', 'js');<\/script>
    <script type="application/json" id="theme-config">
      {
        "routes": {
          "root": {{ routes.root_url | json }},
          "cart": {{ routes.cart_url | json }},
          "cartAdd": {{ routes.cart_add_url | json }},
          "cartChange": {{ routes.cart_change_url | json }},
          "cartUpdate": {{ routes.cart_update_url | json }}
        },
        "currency": {{ cart.currency.iso_code | json }},
        "moneySample": {{ 123456 | money | strip_html | json }},
        "strings": {
          "error": {{ 'general.error' | t | json }},
          "added": {{ 'cart.added' | t | json }}
        }
      }
    <\/script>
    <script src="{{ 'global.js' | asset_url }}" type="module"><\/script>
    {{ content_for_header }}
  </head>

  <body class="template-{{ template.name | handle }}">
    <a class="skip-link" href="#main">{{ 'accessibility.skip' | t }}</a>
    {% sections 'header-group' %}
    <main id="main" tabindex="-1">
      {{ content_for_layout }}
    </main>
    {% sections 'footer-group' %}
    {% section 'cart-drawer' %}
    {%- if settings.consent_banner -%}{% render 'consent-banner' %}{%- endif -%}
    <div class="toast" role="status" aria-live="polite" data-toast hidden></div>
  </body>
</html>
`,"/repo/theme/locales/en.default.json":`{
  "accessibility": {
    "skip": "Skip to content"
  },
  "general": {
    "close": "Close",
    "error": "Something went wrong. Please try again.",
    "not_found": "This page wandered off.",
    "view_all": "View all"
  },
  "header": {
    "cart": {
      "one": "Bag, {{ count }} item",
      "other": "Bag, {{ count }} items"
    },
    "country": "Country and currency",
    "menu": "Menu",
    "primary": "Primary",
    "quiz": "Find your blend"
  },
  "newsletter": {
    "label": "Email",
    "placeholder": "you@example.com",
    "submit": "Subscribe",
    "success": "You're on the list. First letter arrives on Sunday."
  },
  "consent": {
    "title": "Cookies, briefly",
    "text": "We use cookies to understand what people read and to measure ads. You can say no and the shop works the same.",
    "accept": "Accept all",
    "decline": "Essential only"
  },
  "products": {
    "about": "About this blend",
    "add_to_cart": "Add to bag",
    "deliver_every": "Deliver every",
    "delivery_to": "Delivers to {{ country }} in {{ estimate }}",
    "delivery_generic": "Ships to {{ country }}",
    "facts_title": "Supplement Facts",
    "facts_serving": "Serving size {{ size }}",
    "facts_servings": "Servings per container {{ count }}",
    "facts_amount": "Amount per serving",
    "facts_dv": "% Daily Value",
    "facts_nutrient": "Nutrient",
    "fda": "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.",
    "gallery": "Product images",
    "one_time": "One-time purchase",
    "pack_cta": "Make it a pack",
    "pack_cta_text": "Add two more tonics and save 10%, or four more for 15%.",
    "ritual": "How to take it",
    "save_pct": "Save {{ pct }}%",
    "servings": {
      "one": "{{ count }} stick",
      "other": "{{ count }} sticks"
    },
    "sold_out": "Sold out",
    "sub_perks": "Skip, swap or cancel anytime.",
    "subscribe_from": "or {{ price }} subscribed",
    "sub_perks_us": "Skip, swap or cancel anytime. Free US shipping."
  },
  "pack": {
    "add": "Add pack to bag",
    "add_one": "Add one {{ product }}",
    "remove_one": "Remove one {{ product }}",
    "quantity_for": "Quantity of {{ product }}",
    "note": "Pack discounts are applied at checkout and stack with the subscription price.",
    "subtotal": "Subtotal",
    "total": "Estimated total",
    "your_pack": "Your pack",
    "options": "Options"
  },
  "quiz": {
    "back": "Back",
    "build": "Build this pack",
    "next": "Next",
    "no_js": "Browse all tonics instead",
    "restart": "Start over",
    "result_eyebrow": "Your ritual",
    "result_heading": "Three tonics for how you live",
    "start": "Start the quiz"
  },
  "cart": {
    "added": "Added to your bag",
    "browse": "Browse the tonics",
    "checkout": "Check out securely",
    "decrease": "Decrease {{ product }}",
    "increase": "Increase {{ product }}",
    "empty": "Your bag is empty",
    "empty_text": "Not sure what to pick? The quiz takes about a minute.",
    "pack_saving": "You save {{ amount }} as a pack",
    "pack_title": {
      "one": "Pack of {{ count }}",
      "other": "Pack of {{ count }}"
    },
    "quantity": "Quantity of {{ product }}",
    "remove": "Remove",
    "remove_pack": "Remove pack",
    "shipping_free": "Free shipping unlocked",
    "shipping_progress": "Progress to free shipping",
    "shipping_remaining": "{{ amount }} away from free shipping",
    "subtotal": "Subtotal",
    "take_quiz": "Take the quiz",
    "taxes": "Taxes, duties and shipping are calculated at checkout.",
    "title": "Your bag"
  },
  "collections": {
    "all": "All",
    "empty": "No tonics here yet.",
    "filter_goal": "Filter by goal"
  },
  "compare": {
    "feature": "Feature",
    "one_time": "One-time",
    "subscription": "Subscription"
  },
  "ingredients": {
    "back": "\u2190 All ingredients",
    "found_in": "Found in",
    "harvest": "Harvest",
    "origin": "Grown in"
  }
}`,"/repo/theme/sections/announcement.liquid":`{%- comment -%} One line, market-aware: the free-shipping amount follows the visitor's currency. {%- endcomment -%}
{%- liquid
  assign threshold = 0
  assign lines = settings.free_shipping_thresholds | newline_to_br | split: '<br />'
  for raw in lines
    assign pair = raw | strip | split: ':'
    if pair[0] == cart.currency.iso_code
      assign threshold = pair[1] | strip | times: 100
    endif
  endfor
  assign threshold_money = threshold | money_without_trailing_zeros
-%}
<div class="announce">
  {%- if section.settings.link != blank %}<a href="{{ section.settings.link }}">{% endif -%}
  {%- if threshold > 0 -%}
    {{ section.settings.text | replace: '[threshold]', threshold_money }}
  {%- else -%}
    {{ section.settings.fallback }}
  {%- endif -%}
  {%- if section.settings.link != blank %}</a>{% endif -%}
</div>

{% schema %}
{
  "name": "Announcement",
  "enabled_on": { "groups": ["header"] },
  "settings": [
    { "type": "text", "id": "text", "label": "Text", "default": "Free shipping over [threshold] \xB7 Pause or skip your subscription anytime", "info": "[threshold] becomes the free-shipping amount in the visitor's currency." },
    { "type": "text", "id": "fallback", "label": "Text when no threshold applies", "default": "Shipping worldwide from Bali \xB7 Pause or skip anytime" },
    { "type": "url", "id": "link", "label": "Link" }
  ]
}
{% endschema %}
`,"/repo/theme/sections/cart-drawer.liquid":`<dialog class="drawer" id="cart-drawer" aria-label="{{ 'cart.title' | t }}">
  <cart-items data-cart-root="cart-drawer" data-count="{{ cart.item_count }}" style="display:contents">
    <div class="drawer__head">
      <p class="d-3">{{ 'cart.title' | t }} <span class="muted">({{ cart.item_count }})</span></p>
      <button type="button" class="icon-btn" data-close-dialog aria-label="{{ 'general.close' | t }}">{% render 'icon', name: 'close' %}</button>
    </div>
    {%- if cart.item_count > 0 -%}
      <div class="drawer__body">
        {% render 'shipping-bar' %}
        {% render 'cart-lines' %}
      </div>
      <form class="drawer__foot" action="{{ routes.cart_url }}" method="post">
        <div class="totals"><span>{{ 'cart.subtotal' | t }}</span><span>{{ cart.total_price | money_with_currency }}</span></div>
        <p class="xsmall muted">{{ 'cart.taxes' | t }}</p>
        <button type="submit" name="checkout" class="btn btn--block">{{ 'cart.checkout' | t }} {% render 'icon', name: 'arrow' %}</button>
      </form>
    {%- else -%}
      <div class="drawer__body stack" style="--gap:18px;align-content:center;text-align:center;justify-items:center">
        <p class="d-2">{{ 'cart.empty' | t }}</p>
        <p class="muted small">{{ 'cart.empty_text' | t }}</p>
        <a href="/pages/quiz" class="btn">{{ 'cart.take_quiz' | t }}</a>
        <a href="{{ routes.all_products_collection_url }}" class="link small">{{ 'cart.browse' | t }}</a>
      </div>
    {%- endif -%}
  </cart-items>
</dialog>

{% schema %}
{ "name": "Cart drawer", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/compare.liquid":`<section class="section container" aria-labelledby="cmp-{{ section.id }}">
  <div class="cmp">
    <div class="stack" style="--gap:16px;align-content:start">
      <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
      <h2 class="d-1" id="cmp-{{ section.id }}">{{ section.settings.heading | escape }}</h2>
      <p class="muted">{{ section.settings.text | escape }}</p>
    </div>
    <div class="cmp__table-wrap">
      <table class="cmp__table">
        <thead><tr><th scope="col"><span class="visually-hidden">{{ 'compare.feature' | t }}</span></th><th scope="col">{{ 'compare.one_time' | t }}</th><th scope="col" class="cmp__hi">{{ 'compare.subscription' | t }}</th></tr></thead>
        <tbody>
          {%- for block in section.blocks -%}
            <tr {{ block.shopify_attributes }}>
              <th scope="row">{{ block.settings.feature | escape }}</th>
              <td>{{ block.settings.one_time | escape }}</td>
              <td class="cmp__hi">{{ block.settings.subscription | escape }}</td>
            </tr>
          {%- endfor -%}
        </tbody>
      </table>
    </div>
  </div>
</section>

<style>
  .cmp { display: grid; gap: 32px; }
  @media (min-width: 1000px) { .cmp { grid-template-columns: 1fr 1.3fr; align-items: start; } }
  .cmp__table-wrap { overflow-x: auto; border-radius: var(--r-lg); background: #fff; border: 1.5px solid var(--line); }
  .cmp__table { width: 100%; min-width: 460px; }
  .cmp__table th, .cmp__table td { padding: 16px 20px; text-align: left; border-bottom: 1px solid var(--line); }
  .cmp__table tbody tr:last-child > * { border-bottom: 0; }
  .cmp__table thead th { font-weight: 650; }
  .cmp__table tbody th { font-weight: 500; color: var(--muted); }
  .cmp__hi { background: color-mix(in srgb, var(--leaf) 8%, transparent); font-weight: 600; }
</style>

{% schema %}
{
  "name": "Subscription comparison",
  "tag": "div",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "One-time or subscribe" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Subscribing is cheaper and you stay in control" },
    { "type": "text", "id": "text", "label": "Text", "default": "Skip a month, swap a flavour or cancel from your account page. No emails to customer service." }
  ],
  "blocks": [
    { "type": "row", "name": "Row", "settings": [
      { "type": "text", "id": "feature", "label": "Feature", "default": "Price per stick" },
      { "type": "text", "id": "one_time", "label": "One-time", "default": "$1.13" },
      { "type": "text", "id": "subscription", "label": "Subscription", "default": "$0.96" }
    ] }
  ],
  "presets": [{ "name": "Subscription comparison", "blocks": [{ "type": "row" }] }]
}
{% endschema %}
`,"/repo/theme/sections/faq.liquid":`<section class="section container" aria-labelledby="faq-{{ section.id }}">
  <div class="faq">
    <h2 class="d-1" id="faq-{{ section.id }}">{{ section.settings.heading | escape }}</h2>
    <div class="faq__list">
      {%- for block in section.blocks -%}
        <details class="faq__item" {{ block.shopify_attributes }}>
          <summary class="d-3">{{ block.settings.q | escape }}<span aria-hidden="true">{% render 'icon', name: 'plus' %}</span></summary>
          <div class="rte muted">{{ block.settings.a }}</div>
        </details>
      {%- endfor -%}
    </div>
  </div>
</section>

<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {%- for block in section.blocks -%}
        { "@type": "Question", "name": {{ block.settings.q | json }}, "acceptedAnswer": { "@type": "Answer", "text": {{ block.settings.a | strip_html | json }} } }{% unless forloop.last %},{% endunless %}
      {%- endfor -%}
    ]
  }
<\/script>

<style>
  .faq { display: grid; gap: 28px; }
  @media (min-width: 1000px) { .faq { grid-template-columns: 1fr 1.6fr; } }
  .faq__item { border-bottom: 1.5px solid var(--line); }
  .faq__item summary { list-style: none; display: flex; justify-content: space-between; gap: 16px; padding: 20px 0; cursor: pointer; font-size: var(--t-md); }
  .faq__item summary::-webkit-details-marker { display: none; }
  .faq__item summary span { transition: transform 300ms var(--spring); }
  .faq__item[open] summary span { transform: rotate(45deg); }
  .faq__item .rte { padding-bottom: 20px; max-width: 62ch; }
</style>

{% schema %}
{
  "name": "FAQ",
  "tag": "div",
  "settings": [{ "type": "text", "id": "heading", "label": "Heading", "default": "Questions" }],
  "blocks": [
    { "type": "qa", "name": "Question", "settings": [
      { "type": "text", "id": "q", "label": "Question", "default": "How do I take it?" },
      { "type": "richtext", "id": "a", "label": "Answer", "default": "<p>Stir one stick into 250 ml of water, hot or cold. Most people take it in the morning.</p>" }
    ] }
  ],
  "presets": [{ "name": "FAQ", "blocks": [{ "type": "qa" }] }]
}
{% endschema %}
`,"/repo/theme/sections/footer-group.json":`{
  "type": "footer",
  "name": "Footer group",
  "sections": {
    "footer": {
      "type": "footer",
      "blocks": {
        "shop": { "type": "menu", "settings": { "heading": "Shop", "menu": "main-menu" } },
        "help": { "type": "menu", "settings": { "heading": "Help", "menu": "footer" } }
      },
      "block_order": ["shop", "help"],
      "settings": {}
    }
  },
  "order": ["footer"]
}
`,"/repo/theme/sections/footer.liquid":`<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__signup">
        <p class="d-2">{{ section.settings.heading | escape }}</p>
        <p class="small" style="opacity:.75">{{ section.settings.text | escape }}</p>
        {%- form 'customer', id: 'footer-signup' -%}
          <input type="hidden" name="contact[tags]" value="newsletter,source:footer">
          {%- if form.posted_successfully? -%}
            <p class="small" role="status">{{ 'newsletter.success' | t }}</p>
          {%- else -%}
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <label for="footer-email" class="visually-hidden">{{ 'newsletter.label' | t }}</label>
              <input id="footer-email" class="input" type="email" name="contact[email]" required autocomplete="email" placeholder="{{ 'newsletter.placeholder' | t }}" style="flex:1 1 220px">
              <button class="btn btn--light" type="submit">{{ 'newsletter.submit' | t }}</button>
            </div>
          {%- endif -%}
        {%- endform -%}
      </div>
      {%- for block in section.blocks -%}
        <nav {{ block.shopify_attributes }} aria-label="{{ block.settings.heading | escape }}">
          <p class="small" style="opacity:.6">{{ block.settings.heading | escape }}</p>
          <ul role="list" class="footer__links">
            {%- for link in block.settings.menu.links -%}<li><a href="{{ link.url }}">{{ link.title | escape }}</a></li>{%- endfor -%}
          </ul>
        </nav>
      {%- endfor -%}
    </div>
    <div class="footer__legal xsmall">
      <p class="fda">{{ section.settings.disclaimer | escape }}</p>
      <p style="opacity:.6">&copy; {{ 'now' | date: '%Y' }} {{ shop.name }}</p>
    </div>
  </div>
</footer>

{% schema %}
{
  "name": "Footer",
  "enabled_on": { "groups": ["footer"] },
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "A short letter every other Sunday." },
    { "type": "text", "id": "text", "label": "Text", "default": "Harvest notes from our growers in Java and Bali, and early access to seasonal blends." },
    {
      "type": "textarea",
      "id": "disclaimer",
      "label": "Disclaimer",
      "default": "*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."
    }
  ],
  "blocks": [
    {
      "type": "menu",
      "name": "Menu",
      "settings": [
        { "type": "text", "id": "heading", "label": "Heading", "default": "Shop" },
        { "type": "link_list", "id": "menu", "label": "Menu", "default": "footer" }
      ]
    }
  ]
}
{% endschema %}
`,"/repo/theme/sections/header-group.json":`{
  "type": "header",
  "name": "Header group",
  "sections": {
    "announcement": { "type": "announcement", "settings": {} },
    "header": { "type": "header", "settings": { "menu": "main-menu", "quiz_link": "/pages/quiz" } }
  },
  "order": ["announcement", "header"]
}
`,"/repo/theme/sections/header.liquid":`<header class="header">
  <div class="container header__inner">
    <button type="button" class="icon-btn menu-btn" data-open-dialog="menu" aria-label="{{ 'header.menu' | t }}">{% render 'icon', name: 'menu' %}</button>
    <a href="{{ routes.root_url }}" class="wordmark" aria-label="{{ shop.name | escape }}">
      {%- if settings.logo -%}
        {{ settings.logo | image_url: width: 300 | image_tag: height: 32, alt: shop.name }}
      {%- else -%}
        {{ settings.wordmark | escape }}<span>.</span>
      {%- endif -%}
    </a>
    <nav class="nav" aria-label="{{ 'header.primary' | t }}">
      {%- for link in section.settings.menu.links -%}
        <a href="{{ link.url }}" {% if link.current %}aria-current="page"{% endif %}>{{ link.title | escape }}</a>
      {%- endfor -%}
    </nav>
    <div class="header__actions">
      {%- if localization.available_countries.size > 1 -%}
        {%- form 'localization', class: 'locale', id: 'header-locale' -%}
          <label for="header-country" class="visually-hidden">{{ 'header.country' | t }}</label>
          <select id="header-country" name="country_code" class="select">
            {%- for country in localization.available_countries -%}
              <option value="{{ country.iso_code }}" {% if country.iso_code == localization.country.iso_code %}selected{% endif %}>
                {{ country.name }} \xB7 {{ country.currency.iso_code }} {{ country.currency.symbol }}
              </option>
            {%- endfor -%}
          </select>
        {%- endform -%}
      {%- endif -%}
      {%- if section.settings.quiz_link != blank -%}
        <a href="{{ section.settings.quiz_link }}" class="btn btn--sm btn--ghost" style="display:none" data-desktop-only>{{ 'header.quiz' | t }}</a>
      {%- endif -%}
      <a href="{{ routes.cart_url }}" class="icon-btn" data-open-dialog="cart-drawer" aria-label="{{ 'header.cart' | t: count: cart.item_count }}">
        {% render 'icon', name: 'bag' %}
        <span class="cart-badge" data-cart-count data-count="{{ cart.item_count }}">{{ cart.item_count }}</span>
      </a>
    </div>
  </div>
</header>

<dialog class="drawer drawer--left" id="menu" aria-label="{{ 'header.menu' | t }}">
  <div class="drawer__head">
    <span class="wordmark" style="font-size:1.5rem">{{ settings.wordmark }}<span>.</span></span>
    <button type="button" class="icon-btn" data-close-dialog aria-label="{{ 'general.close' | t }}">{% render 'icon', name: 'close' %}</button>
  </div>
  <div class="drawer__body">
    <nav class="stack" style="--gap:4px">
      {%- for link in section.settings.menu.links -%}
        <a href="{{ link.url }}" class="d-2" style="text-decoration:none;padding:8px 0">{{ link.title | escape }}</a>
      {%- endfor -%}
    </nav>
  </div>
  {%- if localization.available_countries.size > 1 -%}
    <div class="drawer__foot">
      {%- form 'localization', id: 'menu-locale' -%}
        <label for="menu-country" class="small muted">{{ 'header.country' | t }}</label>
        <select id="menu-country" name="country_code" class="select" style="margin-top:6px">
          {%- for country in localization.available_countries -%}
            <option value="{{ country.iso_code }}" {% if country.iso_code == localization.country.iso_code %}selected{% endif %}>{{ country.name }} \xB7 {{ country.currency.iso_code }}</option>
          {%- endfor -%}
        </select>
      {%- endform -%}
    </div>
  {%- endif -%}
</dialog>

<style>
  @media (min-width: 1000px) { [data-desktop-only] { display: inline-flex !important; } }
</style>

{% schema %}
{
  "name": "Header",
  "enabled_on": { "groups": ["header"] },
  "settings": [
    { "type": "link_list", "id": "menu", "label": "Menu", "default": "main-menu" },
    { "type": "url", "id": "quiz_link", "label": "Quiz button link" }
  ]
}
{% endschema %}
`,"/repo/theme/sections/hero.liquid":`{%- liquid
  assign is_first = false
  if section.index == 1
    assign is_first = true
  endif
-%}
<section class="hero container" style="--tone: {{ section.settings.tone }}; --on-tone: {{ section.settings.on_tone }}">
  <div class="hero__copy">
    <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
    {%- if is_first -%}
      <h1 class="d-hero">{{ section.settings.heading | escape }}</h1>
    {%- else -%}
      <h2 class="d-hero">{{ section.settings.heading | escape }}</h2>
    {%- endif -%}
    <p class="lead muted">{{ section.settings.text | escape }}</p>
    <div class="hero__ctas">
      {%- if section.settings.primary_label != blank -%}<a href="{{ section.settings.primary_link }}" class="btn">{{ section.settings.primary_label | escape }} {% render 'icon', name: 'arrow' %}</a>{%- endif -%}
      {%- if section.settings.secondary_label != blank -%}<a href="{{ section.settings.secondary_link }}" class="btn btn--ghost">{{ section.settings.secondary_label | escape }}</a>{%- endif -%}
    </div>
    {%- if section.blocks.size > 0 -%}
      <ul role="list" class="hero__proof small">
        {%- for block in section.blocks -%}<li {{ block.shopify_attributes }}>{% render 'icon', name: 'check' %}{{ block.settings.text | escape }}</li>{%- endfor -%}
      </ul>
    {%- endif -%}
  </div>
  <div class="hero__art tone">
    {%- if section.settings.image -%}
      {%- if is_first -%}
        {{ section.settings.image | image_url: width: 1600 | image_tag: widths: '480, 720, 960, 1200, 1600', sizes: '(min-width: 1000px) 50vw, 100vw', alt: section.settings.image.alt, loading: 'eager', fetchpriority: 'high', preload: true }}
      {%- else -%}
        {{ section.settings.image | image_url: width: 1600 | image_tag: widths: '480, 720, 960, 1200, 1600', sizes: '(min-width: 1000px) 50vw, 100vw', alt: section.settings.image.alt, loading: 'lazy' }}
      {%- endif -%}
    {%- endif -%}
    {%- if section.settings.sticker != blank -%}<span class="sticker hero__sticker">{{ section.settings.sticker | escape }}</span>{%- endif -%}
  </div>
</section>

<style>
  .hero { display: grid; gap: clamp(24px, 4vw, 56px); padding-block: clamp(20px, 3vw, 40px) clamp(40px, 6vw, 88px); align-items: center; }
  .hero__copy { display: grid; gap: 22px; justify-items: start; }
  .hero__ctas { display: flex; flex-wrap: wrap; gap: 10px; }
  .hero__proof { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 20px; color: var(--muted); }
  .hero__proof li { display: inline-flex; gap: 6px; align-items: center; }
  .hero__proof .icon { color: var(--leaf); }
  .hero__art { position: relative; border-radius: var(--r-lg); overflow: hidden; aspect-ratio: 1; }
  .hero__art img { width: 100%; height: 100%; object-fit: cover; }
  .hero__sticker { position: absolute; top: 22px; right: 22px; width: 104px; height: 104px; font-size: 14px; animation: spin-in 900ms var(--spring) both 200ms; }
  @keyframes spin-in { from { transform: rotate(-60deg) scale(0.4); opacity: 0; } to { transform: rotate(-12deg) scale(1); opacity: 1; } }
  @media (min-width: 1000px) {
    .hero { grid-template-columns: 1.05fr 1fr; }
    .hero__art { aspect-ratio: 4 / 4.4; }
  }
</style>

{% schema %}
{
  "name": "Hero",
  "tag": "div",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "Indonesian botanicals, shipped from Bali" },
    { "type": "textarea", "id": "heading", "label": "Heading", "default": "Five centuries of jamu. One stick a day." },
    { "type": "textarea", "id": "text", "label": "Text", "default": "Turmeric, red ginger and butterfly pea, grown by small farms in Java and Bali. Stir into water, hot or cold, and you're done." },
    { "type": "image_picker", "id": "image", "label": "Image" },
    { "type": "color", "id": "tone", "label": "Art background", "default": "#F2B233" },
    { "type": "color", "id": "on_tone", "label": "Art foreground", "default": "#17261C" },
    { "type": "text", "id": "sticker", "label": "Sticker", "default": "Subscribe & save 15%" },
    { "type": "text", "id": "primary_label", "label": "Primary button", "default": "Find your blend" },
    { "type": "url", "id": "primary_link", "label": "Primary link" },
    { "type": "text", "id": "secondary_label", "label": "Secondary button", "default": "Build a pack" },
    { "type": "url", "id": "secondary_link", "label": "Secondary link" }
  ],
  "blocks": [
    { "type": "proof", "name": "Proof point", "settings": [{ "type": "text", "id": "text", "label": "Text", "default": "Third-party tested" }] }
  ],
  "max_blocks": 4,
  "presets": [{ "name": "Hero" }]
}
{% endschema %}
`,"/repo/theme/sections/ingredients.liquid":`{%- comment -%}
  Ingredient index from the \`ingredient\` metaobject definition. Each entry
  links to its own metaobject page (templates/metaobject/ingredient.json),
  so new botanicals appear here as soon as merchandising adds them.
{%- endcomment -%}
<section class="section container" aria-labelledby="ing-{{ section.id }}">
  <div class="sec-head">
    <div class="stack" style="--gap:10px">
      <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
      <h2 class="d-1" id="ing-{{ section.id }}">{{ section.settings.heading | escape }}</h2>
    </div>
    <p class="muted" style="max-width:38ch">{{ section.settings.text | escape }}</p>
  </div>
  <ul role="list" class="ing-grid">
    {%- for ing in shop.metaobjects.ingredient.values limit: section.settings.limit -%}
      <li>
        <a href="{{ ing.system.url }}" class="ing" style="--tone: {{ ing.color | default: settings.color_leaf }}">
          {%- assign art = ing.illustration.value -%}
          {%- if art -%}
            <span class="ing__art" aria-hidden="true">{{ art | image_url: width: 160 | image_tag: widths: '80, 160', sizes: '64px', alt: '', loading: 'lazy' }}</span>
          {%- else -%}
            <span class="ing__dot" aria-hidden="true"></span>
          {%- endif -%}
          <span class="ing__name">{{ ing.name }}</span>
          <span class="xsmall muted"><i>{{ ing.latin_name }}</i></span>
          <span class="xsmall">{{ ing.origin }}</span>
        </a>
      </li>
    {%- endfor -%}
  </ul>
</section>

<style>
  .ing-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  @media (min-width: 700px) { .ing-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (min-width: 1100px) { .ing-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
  .ing { display: grid; gap: 4px; padding: 18px; border-radius: var(--r-md); background: #fff; border: 1.5px solid var(--line); text-decoration: none; height: 100%; transition: border-color 200ms var(--ease), transform 300ms var(--spring); }
  .ing:hover { border-color: var(--tone); transform: translateY(-3px); }
  .ing__dot { width: 34px; height: 34px; border-radius: 50%; background: var(--tone); margin-bottom: 10px; box-shadow: inset -6px -6px 0 rgba(0,0,0,.08); }
  .ing__art { width: 64px; height: 64px; margin-bottom: 6px; transition: transform 400ms var(--spring); }
  .ing:hover .ing__art { transform: rotate(-10deg) scale(1.08); }
  .ing__name { font-weight: 650; font-size: var(--t-md); }
</style>

{% schema %}
{
  "name": "Ingredients",
  "tag": "div",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "What's inside" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Ten plants from three islands" },
    { "type": "text", "id": "text", "label": "Text", "default": "Every ingredient is traceable to the region it's grown in. Tap one to read where it comes from." },
    { "type": "range", "id": "limit", "label": "Ingredients", "min": 3, "max": 20, "step": 1, "default": 10 }
  ],
  "presets": [{ "name": "Ingredients" }]
}
{% endschema %}
`,"/repo/theme/sections/main-404.liquid":`<section class="container section stack" style="--gap:20px;justify-items:start">
  <p class="eyebrow">404</p>
  <h1 class="d-hero">{{ 'general.not_found' | t }}</h1>
  <a href="{{ routes.all_products_collection_url }}" class="btn">{{ 'cart.browse' | t }}</a>
</section>
{% schema %}
{ "name": "404", "tag": "section", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/main-cart.liquid":`<section class="container section--tight cartp">
  <h1 class="d-1">{{ 'cart.title' | t }}</h1>
  <cart-items data-cart-root="{{ section.id }}" data-count="{{ cart.item_count }}" class="cartp__grid">
    {%- if cart.item_count > 0 -%}
      <div>{% render 'shipping-bar' %}{% render 'cart-lines' %}</div>
      <form action="{{ routes.cart_url }}" method="post" class="cartp__summary">
        <div class="totals"><span>{{ 'cart.subtotal' | t }}</span><span>{{ cart.total_price | money_with_currency }}</span></div>
        <p class="xsmall muted">{{ 'cart.taxes' | t }}</p>
        {% render 'delivery-estimate' %}
        <button type="submit" name="checkout" class="btn btn--block">{{ 'cart.checkout' | t }} {% render 'icon', name: 'arrow' %}</button>
        {%- if additional_checkout_buttons -%}<div>{{ content_for_additional_checkout_buttons }}</div>{%- endif -%}
      </form>
    {%- else -%}
      <div class="stack" style="--gap:16px;justify-items:start">
        <p class="lead muted">{{ 'cart.empty_text' | t }}</p>
        <a href="/pages/quiz" class="btn">{{ 'cart.take_quiz' | t }}</a>
      </div>
    {%- endif -%}
  </cart-items>
</section>

<style>
  .cartp { display: grid; gap: 24px; }
  .cartp__grid { display: grid; gap: 24px; }
  .cartp__summary { display: grid; gap: 14px; padding: 22px; border-radius: var(--r-lg); background: #fff; border: 1.5px solid var(--line); align-content: start; }
  @media (min-width: 1000px) { .cartp__grid { grid-template-columns: 1fr 380px; align-items: start; } .cartp__summary { position: sticky; top: calc(var(--header-h) + 16px); } }
</style>

{% schema %}
{ "name": "Cart", "tag": "section", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/main-collection.liquid":`{%- comment -%} Goal filter uses tag URLs (/collections/all/goal-energy), so it works without JS and is cacheable. {%- endcomment -%}
<section class="container section--tight">
  <div class="stack" style="--gap:12px;margin-bottom:24px">
    <h1 class="d-1">{{ collection.title | escape }}</h1>
    {%- if collection.description != blank -%}<div class="muted rte" style="max-width:56ch">{{ collection.description }}</div>{%- endif -%}
  </div>
  {%- liquid
    assign goal_list = ''
    for tag in collection.all_tags
      if tag contains 'goal:'
        assign goal_list = goal_list | append: tag | append: '|'
      endif
    endfor
    assign goal_tags = goal_list | split: '|'
  -%}
  {%- if goal_tags.size > 0 -%}
    <nav class="goals" aria-label="{{ 'collections.filter_goal' | t }}">
      <a href="{{ collection.url }}" class="chip goal" {% if current_tags == blank %}aria-current="page"{% endif %}>{{ 'collections.all' | t }}</a>
      {%- for tag in goal_tags -%}
        <a href="{{ collection.url }}/{{ tag | handleize }}" class="chip goal" {% if current_tags contains tag %}aria-current="page"{% endif %}>{{ tag | remove: 'goal:' | capitalize }}</a>
      {%- endfor -%}
    </nav>
  {%- endif -%}
  {%- paginate collection.products by 24 -%}
    <ul role="list" class="tiles" style="--tiles-d: 3">
      {%- for product in collection.products -%}
        <li>{% render 'product-tile', product: product, eager: forloop.first %}</li>
      {%- else -%}
        <li class="muted">{{ 'collections.empty' | t }}</li>
      {%- endfor -%}
    </ul>
    {%- if paginate.pages > 1 -%}<div style="margin-top:32px">{{ paginate | default_pagination }}</div>{%- endif -%}
  {%- endpaginate -%}
</section>

<style>
  .goals { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .goal { text-decoration: none; padding: 9px 16px; font-size: var(--t-sm); }
  .goal[aria-current='page'] { background: var(--ink); color: var(--paper); }
</style>

{% schema %}
{ "name": "Collection", "tag": "section", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/main-ingredient.liquid":`{%- comment -%}
  Metaobject page for one ingredient (/pages/ingredient/<handle>), driven by
  the \`ingredient\` definition: name, local_name, latin_name, origin, color,
  harvest, story, found_in (product list).
{%- endcomment -%}
{%- assign ing = metaobject -%}
<article class="ingp" style="--tone: {{ ing.color | default: settings.color_leaf }}">
  <header class="container ingp__head">
    <a href="{{ routes.root_url }}#ingredients" class="small link muted">{{ 'ingredients.back' | t }}</a>
    <div class="ingp__hero">
      {%- assign art = ing.illustration.value -%}
      {%- if art -%}
        <div class="ingp__art">{{ art | image_url: width: 700 | image_tag: widths: '280, 420, 560, 700', sizes: '(min-width: 900px) 280px, 60vw', alt: '', loading: 'eager' }}</div>
      {%- else -%}
        <div class="ingp__swatch" aria-hidden="true"><span></span></div>
      {%- endif -%}
      <div class="stack" style="--gap:14px">
        <p class="eyebrow">{{ ing.local_name }}</p>
        <h1 class="d-hero">{{ ing.name }}</h1>
        <p class="lead muted"><i>{{ ing.latin_name }}</i></p>
      </div>
    </div>
  </header>
  <div class="container ingp__body">
    <dl class="ingp__facts">
      <div><dt class="small muted">{{ 'ingredients.origin' | t }}</dt><dd class="d-3">{{ ing.origin }}</dd></div>
      <div><dt class="small muted">{{ 'ingredients.harvest' | t }}</dt><dd class="d-3">{{ ing.harvest }}</dd></div>
    </dl>
    <div class="rte ingp__story">{{ ing.story.value | newline_to_br }}</div>
  </div>
  {%- assign products = ing.found_in.value -%}
  {%- if products.size > 0 -%}
    <section class="container section--tight">
      <h2 class="d-2" style="margin-bottom:20px">{{ 'ingredients.found_in' | t }}</h2>
      <ul role="list" class="tiles">
        {%- for product in products -%}<li>{% render 'product-tile', product: product %}</li>{%- endfor -%}
      </ul>
    </section>
  {%- endif -%}
</article>

<style>
  .ingp__head { display: grid; gap: 24px; padding-block: 24px clamp(24px, 4vw, 48px); }
  .ingp__hero { display: grid; gap: 28px; align-items: center; }
  @media (min-width: 900px) { .ingp__hero { grid-template-columns: 280px 1fr; } }
  .ingp__swatch { width: min(280px, 60vw); aspect-ratio: 1; border-radius: 50%; background: var(--tone); display: grid; place-items: center; box-shadow: inset -24px -24px 0 rgba(0,0,0,.08); }
  .ingp__art { width: min(280px, 60vw); animation: spin-art 900ms var(--spring) both; }
  @keyframes spin-art { from { transform: rotate(-25deg) scale(0.7); opacity: 0; } }
  .ingp__swatch span { width: 38%; height: 38%; border-radius: 50%; background: rgba(255,255,255,.35); transform: translate(-30%, -30%); }
  .ingp__body { display: grid; gap: 32px; padding-bottom: clamp(32px, 5vw, 64px); }
  @media (min-width: 900px) { .ingp__body { grid-template-columns: 280px 1fr; } }
  .ingp__facts { display: grid; gap: 18px; align-content: start; margin: 0; }
  .ingp__facts dd { margin: 4px 0 0; }
  .ingp__story { max-width: 62ch; font-size: var(--t-lg); line-height: 1.5; }
</style>

{% schema %}
{ "name": "Ingredient", "tag": "section", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/main-pack.liquid":`{%- comment -%}
  Build-your-own pack. Lines are added with a shared \`_pack\` property; the
  pack-discount Shopify Function reads it and applies the tier discount at
  checkout, so the price shown here is a preview of a rule enforced
  server-side, not a client-side promise.
{%- endcomment -%}
{%- liquid
  assign plans_source = nil
  for p in section.settings.collection.products
    if p.selling_plan_groups.size > 0 and plans_source == nil
      assign plans_source = p
    endif
  endfor
-%}
{{ 'pack.css' | asset_url | stylesheet_tag }}
<script src="{{ 'pack.js' | asset_url }}" type="module"><\/script>

<pack-builder class="pack container" data-max="{{ section.settings.max_items }}" data-tiers="{{ settings.pack_tiers | escape }}">
  <div class="pack__intro">
    <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
    <h1 class="d-1">{{ section.settings.heading | escape }}</h1>
    <p class="muted">{{ section.settings.text | escape }}</p>
  </div>

  <ul role="list" class="pack__grid">
    {%- for p in section.settings.collection.products -%}
      {%- assign v = p.selected_or_first_available_variant -%}
      <li class="pcard" style="{% render 'tone', product: p %}" data-handle="{{ p.handle }}">
        <div class="pcard__media">
          {{ p.featured_media.preview_image | image_url: width: 600 | image_tag: widths: '240, 400, 600', sizes: '(min-width: 1000px) 18vw, 45vw', alt: '', loading: 'lazy' }}
        </div>
        <div class="pcard__body">
          <span class="xsmall muted">{{ p.metafields.racik.local_name.value }}</span>
          <a href="{{ p.url }}" class="pcard__title">{{ p.title | escape }}</a>
          <span class="xsmall muted">{{ p.metafields.racik.benefit.value }}</span>
          <div class="pcard__row">
            <span class="small" style="font-weight:600">{{ v.price | money }}</span>
            <div class="stepper" role="group" aria-label="{{ 'pack.quantity_for' | t: product: p.title | escape }}">
              <button type="button" data-dec aria-label="{{ 'pack.remove_one' | t: product: p.title | escape }}" disabled>{% render 'icon', name: 'minus' %}</button>
              <output data-count aria-live="polite">0</output>
              <button type="button" data-inc aria-label="{{ 'pack.add_one' | t: product: p.title | escape }}" {% unless v.available %}disabled{% endunless %}>{% render 'icon', name: 'plus' %}</button>
            </div>
          </div>
        </div>
      </li>
    {%- endfor -%}
  </ul>

  <aside class="tray" aria-label="{{ 'pack.your_pack' | t }}">
    <div class="tray__head">
      <p class="d-3">{{ 'pack.your_pack' | t }} <span class="muted" data-count-label>0</span></p>
      <button type="button" class="tray__toggle" data-tray-toggle aria-expanded="false">{{ 'pack.options' | t }} {% render 'icon', name: 'plus' %}</button>
      <p class="small" data-tier-msg></p>
    </div>
    <ol class="tray__slots" role="list" data-slots aria-hidden="true"></ol>

    {%- if plans_source -%}
      {%- assign group = plans_source.selling_plan_groups.first -%}
      <div class="tray__purchase">
        <label class="choice">
          <input type="radio" name="pack-purchase" value="sub" checked>
          <span class="choice__box"><span class="choice__dot"></span><span style="flex:1"><strong>{{ group.name }}</strong></span>
            <select class="select tray__freq" data-plan aria-label="{{ 'products.deliver_every' | t }}">
              {%- for plan in group.selling_plans -%}
                <option value="{{ plan.id }}">{{ plan.options.first.value }}</option>
              {%- endfor -%}
            </select>
          </span>
        </label>
        <label class="choice">
          <input type="radio" name="pack-purchase" value="once">
          <span class="choice__box"><span class="choice__dot"></span><strong>{{ 'products.one_time' | t }}</strong></span>
        </label>
      </div>
    {%- endif -%}

    <dl class="tray__totals">
      <div><dt>{{ 'pack.subtotal' | t }}</dt><dd data-subtotal>\u2014</dd></div>
      <div data-discount-row hidden><dt data-discount-label></dt><dd data-discount>\u2014</dd></div>
      <div class="tray__total"><dt>{{ 'pack.total' | t }}</dt><dd data-total>\u2014</dd></div>
    </dl>
    <button type="button" class="btn btn--block" data-add disabled>{{ 'pack.add' | t }}</button>
    <p class="xsmall muted">{{ 'pack.note' | t }}</p>
  </aside>

  <script type="application/json" data-products>
    {
      {%- for p in section.settings.collection.products -%}
        {%- assign v = p.selected_or_first_available_variant -%}
        {{ p.handle | json }}: {
          "variantId": {{ v.id }},
          "title": {{ p.title | json }},
          "price": {{ v.price }},
          "available": {{ v.available | json }},
          "tone": {{ p.metafields.racik.color.value | default: settings.color_leaf | json }},
          "plans": { {%- for alloc in v.selling_plan_allocations -%}{{ alloc.selling_plan.id | append: '' | json }}: {{ alloc.price }}{% unless forloop.last %},{% endunless %}{%- endfor -%} }
        }{% unless forloop.last %},{% endunless %}
      {%- endfor -%}
    }
  <\/script>
</pack-builder>

{% schema %}
{
  "name": "Pack builder",
  "tag": "section",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "Build a pack" },
    { "type": "textarea", "id": "heading", "label": "Heading", "default": "Pick three or more. Bigger packs cost less." },
    { "type": "textarea", "id": "text", "label": "Text", "default": "Mix flavours or double up on a favourite. Each tonic is a 30-stick pouch." },
    { "type": "collection", "id": "collection", "label": "Tonics" },
    { "type": "range", "id": "max_items", "label": "Maximum pouches per pack", "min": 3, "max": 12, "step": 1, "default": 8 }
  ]
}
{% endschema %}
`,"/repo/theme/sections/main-page.liquid":`<article class="container section--tight" style="max-width:820px">
  <h1 class="d-1">{{ page.title | escape }}</h1>
  <div class="rte" style="margin-top:28px">{{ page.content }}</div>
</article>
{% schema %}
{ "name": "Page", "tag": "section", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/main-product.liquid":`{%- liquid
  assign current = product.selected_or_first_available_variant
  assign form_id = 'product-form-' | append: section.id
  assign ingredients = product.metafields.racik.ingredients.value
  assign has_plans = false
  if product.selling_plan_groups.size > 0
    assign has_plans = true
  endif
-%}

{{ 'product.css' | asset_url | stylesheet_tag }}
<script src="{{ 'product.js' | asset_url }}" type="module"><\/script>

<product-page class="pdp container" data-section-id="{{ section.id }}" data-url="{{ product.url }}" style="{% render 'tone', product: product %}">
  {%- comment -%} ---------- Gallery ---------- {%- endcomment -%}
  <div class="pdp__gallery">
    <div class="pdp__stage tone" data-stage>
      {%- for media in product.media -%}
        <figure class="pdp__slide" data-slide="{{ forloop.index0 }}" {% unless forloop.first %}hidden{% endunless %}>
          {%- if forloop.first -%}
            {{ media | image_url: width: 1400 | image_tag: widths: '480, 720, 960, 1200, 1400', sizes: '(min-width: 1000px) 52vw, 100vw', alt: media.alt, loading: 'eager', fetchpriority: 'high', preload: true }}
          {%- else -%}
            {{ media | image_url: width: 1400 | image_tag: widths: '480, 720, 960, 1200, 1400', sizes: '(min-width: 1000px) 52vw, 100vw', alt: media.alt, loading: 'lazy' }}
          {%- endif -%}
        </figure>
      {%- endfor -%}
      {%- if has_plans -%}<span class="sticker pdp__sticker">{{ settings.subscribe_badge }}</span>{%- endif -%}
    </div>
    {%- if product.media.size > 1 -%}
      <div class="pdp__thumbs" role="tablist" aria-label="{{ 'products.gallery' | t }}">
        {%- for media in product.media -%}
          <button type="button" class="pdp__thumb tone" role="tab" aria-selected="{% if forloop.first %}true{% else %}false{% endif %}" data-thumb="{{ forloop.index0 }}" aria-label="{{ media.alt | escape }}">
            {{ media | image_url: width: 200 | image_tag: widths: '100, 200', sizes: '88px', alt: '', loading: 'lazy' }}
          </button>
        {%- endfor -%}
      </div>
    {%- endif -%}
  </div>

  {%- comment -%} ---------- Info ---------- {%- endcomment -%}
  <div class="pdp__info">
    <div class="stack" style="--gap:10px">
      {%- if product.metafields.racik.local_name != blank -%}
        <p class="eyebrow">{{ product.metafields.racik.local_name.value }}</p>
      {%- endif -%}
      <h1 class="d-1">{{ product.title | escape }}</h1>
      {%- if product.metafields.racik.benefit != blank -%}
        <p class="lead muted">{{ product.metafields.racik.benefit.value }}*</p>
      {%- endif -%}
    </div>

    {%- if ingredients -%}
      <ul role="list" class="pdp__chips">
        {%- for ing in ingredients -%}
          <li><a class="chip" href="{{ ing.system.url }}"><span class="dot" style="background: {{ ing.color }}"></span>{{ ing.name }}</a></li>
        {%- endfor -%}
      </ul>
    {%- endif -%}

    <div id="buybox-{{ section.id }}" class="buybox">
      {%- unless product.has_only_default_variant -%}
        <fieldset class="pdp__sizes">
          <legend class="small" style="font-weight:600;margin-bottom:10px">{{ product.options.first }}</legend>
          <div class="pills">
            {%- for variant in product.variants -%}
              <label class="pill">
                <input type="radio" name="size-{{ section.id }}" value="{{ variant.id }}" data-variant-radio {% if variant.id == current.id %}checked{% endif %} {% unless variant.available %}disabled{% endunless %}>
                <span>{{ variant.title }}</span>
              </label>
            {%- endfor -%}
          </div>
        </fieldset>
      {%- endunless -%}

      <purchase-options class="stack" style="--gap:10px">
        {%- unless product.requires_selling_plan -%}
          <label class="choice">
            <input type="radio" name="purchase-{{ section.id }}" value="" data-label="{{ current.price | money }}" {% unless has_plans %}checked{% endunless %}>
            <span class="choice__box">
              <span class="choice__dot"></span>
              <span style="flex:1"><strong>{{ 'products.one_time' | t }}</strong></span>
              <span class="price">{{ current.price | money }}</span>
            </span>
          </label>
        {%- endunless -%}
        {%- for group in product.selling_plan_groups -%}
          {%- liquid
            assign first_plan = group.selling_plans.first
            assign first_alloc = nil
            for alloc in current.selling_plan_allocations
              if alloc.selling_plan.id == first_plan.id
                assign first_alloc = alloc
              endif
            endfor
            assign pct = first_plan.price_adjustments.first.value
          -%}
          <label class="choice">
            <input type="radio" name="purchase-{{ section.id }}" value="{{ first_plan.id }}" data-subscription data-label="{{ first_alloc.price | money }}" {% if forloop.first %}checked{% endif %}>
            <span class="choice__box choice__box--sub">
              <span class="choice__dot"></span>
              <span style="flex:1;display:grid;gap:2px">
                <strong>{{ group.name }} <span class="chip chip--tone" style="margin-left:6px">{{ 'products.save_pct' | t: pct: pct }}</span></strong>
                <span class="xsmall muted">{% if localization.country.iso_code == 'US' %}{{ 'products.sub_perks_us' | t }}{% else %}{{ 'products.sub_perks' | t }}{% endif %}</span>
              </span>
              <span class="price">{% if first_alloc.compare_at_price > first_alloc.price %}<s>{{ first_alloc.compare_at_price | money }}</s>{% endif %}<span>{{ first_alloc.price | money }}</span></span>
            </span>
          </label>
          {%- if group.selling_plans.size > 1 -%}
            <div class="freq" data-frequency>
              <label for="freq-{{ section.id }}" class="small">{{ 'products.deliver_every' | t }}</label>
              <select id="freq-{{ section.id }}" class="select">
                {%- for plan in group.selling_plans -%}
                  {%- liquid
                    assign plan_price = current.price
                    for alloc in current.selling_plan_allocations
                      if alloc.selling_plan.id == plan.id
                        assign plan_price = alloc.price
                      endif
                    endfor
                  -%}
                  <option value="{{ plan.id }}" data-label="{{ plan_price | money }}">{{ plan.options.first.value }}</option>
                {%- endfor -%}
              </select>
            </div>
          {%- endif -%}
        {%- endfor -%}
      </purchase-options>

      <product-form>
        {%- form 'product', product, id: form_id, novalidate: 'novalidate' -%}
          <input type="hidden" name="id" value="{{ current.id }}">
          <input type="hidden" name="selling_plan" value="{% if has_plans %}{{ product.selling_plan_groups.first.selling_plans.first.id }}{% endif %}" data-plan-input>
          <button type="submit" name="add" class="btn btn--block btn--atc" data-atc {% unless current.available %}disabled{% endunless %}>
            {%- if current.available -%}
              <span>{{ 'products.add_to_cart' | t }}</span><span aria-hidden="true">\xB7</span><span data-atc-price>{% if has_plans %}{{ current.selling_plan_allocations.first.price | money }}{% else %}{{ current.price | money }}{% endif %}</span>
            {%- else -%}
              {{ 'products.sold_out' | t }}
            {%- endif -%}
          </button>
          <p class="small" role="alert" data-error hidden style="color:#9B2C1E"></p>
        {%- endform -%}
      </product-form>
    </div>

    {% render 'delivery-estimate' %}

    {%- if section.settings.pack_page != blank and has_plans -%}
      <a class="pack-cta" href="{{ section.settings.pack_page.url }}?add={{ product.handle }}">
        <span class="pack-cta__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span><strong>{{ 'products.pack_cta' | t }}</strong><br><span class="small muted">{{ 'products.pack_cta_text' | t }}</span></span>
        {% render 'icon', name: 'arrow' %}
      </a>
    {%- endif -%}

    <div class="pdp__acc">
      <details open>
        <summary class="d-3">{{ 'products.ritual' | t }}<span aria-hidden="true">{% render 'icon', name: 'plus' %}</span></summary>
        <div class="rte">{{ product.metafields.racik.ritual.value | default: product.description | newline_to_br }}</div>
      </details>
      <details>
        <summary class="d-3">{{ 'products.about' | t }}<span aria-hidden="true">{% render 'icon', name: 'plus' %}</span></summary>
        <div class="rte">{{ product.description }}</div>
      </details>
      <details>
        <summary class="d-3">{{ 'products.facts_title' | t }}<span aria-hidden="true">{% render 'icon', name: 'plus' %}</span></summary>
        {% render 'supplement-facts', product: product %}
      </details>
    </div>
    <p class="xsmall muted">* {{ 'products.fda' | t }}</p>
  </div>
</product-page>

<script type="application/ld+json">{{ product | structured_data }}<\/script>

{% schema %}
{
  "name": "Product",
  "tag": "section",
  "settings": [
    { "type": "page", "id": "pack_page", "label": "Pack builder page" }
  ]
}
{% endschema %}
`,"/repo/theme/sections/main-quiz.liquid":`{%- comment -%}
  Ritual finder. Questions and answers are blocks, so merchandising edits
  them in the theme editor. Each answer carries tags; products score one
  point per matching product tag (e.g. goal:energy, time:morning), and the
  top three become a ready-made pack.
{%- endcomment -%}
{{ 'quiz.css' | asset_url | stylesheet_tag }}
<script src="{{ 'quiz.js' | asset_url }}" type="module"><\/script>

<ritual-quiz class="quiz container" data-pack-url="{{ section.settings.pack_page.url }}">
  <div class="quiz__top">
    <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
    <div class="quiz__progress" aria-hidden="true"><span data-progress></span></div>
    <p class="small muted" data-step-label aria-live="polite"></p>
  </div>

  <div class="quiz__intro" data-screen="intro">
    <h1 class="d-hero">{{ section.settings.heading | escape }}</h1>
    <p class="lead muted">{{ section.settings.text | escape }}</p>
    <button type="button" class="btn" data-start>{{ 'quiz.start' | t }} {% render 'icon', name: 'arrow' %}</button>
    <noscript><a class="link" href="{{ section.settings.collection.url }}">{{ 'quiz.no_js' | t }}</a></noscript>
  </div>

  {%- for block in section.blocks -%}
    {%- assign answers = block.settings.answers | newline_to_br | split: '<br />' -%}
    {%- assign q_index = forloop.index -%}
    <fieldset class="quiz__q" data-screen="q" data-multi="{{ block.settings.multi }}" hidden {{ block.shopify_attributes }}>
      <legend class="d-1">{{ block.settings.question | escape }}</legend>
      {%- if block.settings.help != blank -%}<p class="muted">{{ block.settings.help | escape }}</p>{%- endif -%}
      <div class="quiz__answers">
        {%- for raw in answers -%}
          {%- assign parts = raw | split: '|' -%}
          {%- assign label = parts[0] | strip -%}
          {%- if label != blank -%}
            <label class="answer">
              <input type="{% if block.settings.multi %}checkbox{% else %}radio{% endif %}" name="q{{ q_index }}" value="{{ parts[1] | strip | escape }}" data-label="{{ label | escape }}">
              <span class="answer__box"><span class="answer__tick" aria-hidden="true">{% render 'icon', name: 'check' %}</span>{{ label | escape }}</span>
            </label>
          {%- endif -%}
        {%- endfor -%}
      </div>
      <div class="quiz__nav">
        <button type="button" class="btn btn--ghost btn--sm" data-back>{{ 'quiz.back' | t }}</button>
        <button type="button" class="btn" data-next disabled>{{ 'quiz.next' | t }} {% render 'icon', name: 'arrow' %}</button>
      </div>
    </fieldset>
  {%- endfor -%}

  <div class="quiz__result" data-screen="result" hidden aria-live="polite">
    <p class="eyebrow">{{ 'quiz.result_eyebrow' | t }}</p>
    <h2 class="d-1">{{ 'quiz.result_heading' | t }}</h2>
    <p class="muted" data-summary></p>
    <ol role="list" class="quiz__picks" data-picks></ol>
    <div class="quiz__actions">
      <a class="btn" data-build href="{{ section.settings.pack_page.url }}">{{ 'quiz.build' | t }} {% render 'icon', name: 'arrow' %}</a>
      <button type="button" class="btn btn--ghost" data-restart>{{ 'quiz.restart' | t }}</button>
    </div>
  </div>

  <script type="application/json" data-products>
    [
      {%- for p in section.settings.collection.products limit: 24 -%}
        {%- liquid
          assign v = p.selected_or_first_available_variant
          assign tone = p.metafields.racik.color.value | default: settings.color_leaf
          assign brightness = tone | color_brightness
          assign on_tone = '#FFFFFF'
          if brightness > 140
            assign on_tone = settings.color_ink
          endif
          assign img = p.featured_media.preview_image | image_url: width: 500
          assign quiz_tags = ''
          for tag in p.tags
            if tag contains ':'
              assign quiz_tags = quiz_tags | append: tag | append: ','
            endif
          endfor
        -%}
        {
          "handle": {{ p.handle | json }},
          "title": {{ p.title | json }},
          "local": {{ p.metafields.racik.local_name.value | json }},
          "benefit": {{ p.metafields.racik.benefit.value | json }},
          "url": {{ p.url | json }},
          "image": {{ img | json }},
          "tone": {{ tone | json }},
          "onTone": {{ on_tone | json }},
          "price": {{ v.price | money | json }},
          "available": {{ v.available | json }},
          "tags": {{ quiz_tags | split: ',' | json }}
        }{% unless forloop.last %},{% endunless %}
      {%- endfor -%}
    ]
  <\/script>
</ritual-quiz>

{% schema %}
{
  "name": "Ritual quiz",
  "tag": "section",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "Ritual finder" },
    { "type": "textarea", "id": "heading", "label": "Heading", "default": "Let's find your three." },
    { "type": "textarea", "id": "text", "label": "Text", "default": "Four questions about your day. We'll match you with three tonics and set them up as a pack, which takes 10% off." },
    { "type": "collection", "id": "collection", "label": "Products to recommend from" },
    { "type": "page", "id": "pack_page", "label": "Pack builder page" }
  ],
  "blocks": [
    {
      "type": "question",
      "name": "Question",
      "settings": [
        { "type": "text", "id": "question", "label": "Question", "default": "What would you like more of?" },
        { "type": "text", "id": "help", "label": "Help text" },
        { "type": "checkbox", "id": "multi", "label": "Allow several answers", "default": false },
        {
          "type": "textarea",
          "id": "answers",
          "label": "Answers",
          "info": "One per line: Label | tag, tag. Products with a matching tag score a point.",
          "default": "Steady energy | goal:energy\\nCalmer evenings | goal:calm"
        }
      ]
    }
  ],
  "presets": [{ "name": "Ritual quiz" }]
}
{% endschema %}
`,"/repo/theme/sections/quiz-band.liquid":`<section class="container section--tight">
  <div class="band tone" style="--tone: {{ section.settings.tone }}; --on-tone: {{ section.settings.on_tone }}">
    <div class="stack" style="--gap:18px">
      <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
      <h2 class="d-1">{{ section.settings.heading | escape }}</h2>
      <p class="lead">{{ section.settings.text | escape }}</p>
      <a href="{{ section.settings.link }}" class="btn btn--light" style="justify-self:start">{{ section.settings.button | escape }} {% render 'icon', name: 'arrow' %}</a>
    </div>
    <ul role="list" class="band__chips" aria-hidden="true">
      {%- assign chips = section.settings.chips | split: ',' -%}
      {%- for chip in chips -%}<li style="--i: {{ forloop.index0 }}">{{ chip | strip }}</li>{%- endfor -%}
    </ul>
  </div>
</section>

<style>
  .band { display: grid; gap: 32px; padding: clamp(28px, 5vw, 72px); border-radius: var(--r-lg); overflow: hidden; }
  .band__chips { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; align-content: center; }
  .band__chips li {
    padding: 12px 20px;
    border-radius: var(--pill);
    background: rgba(255, 255, 255, 0.14);
    border: 1.5px solid rgba(255, 255, 255, 0.35);
    font-weight: 600;
    transform: rotate(calc((var(--i) - 3) * 1.6deg));
  }
  .band__chips li:nth-child(3n) { background: var(--paper); color: var(--ink); border-color: var(--paper); }
  @media (min-width: 1000px) { .band { grid-template-columns: 1.2fr 1fr; align-items: center; } }
</style>

{% schema %}
{
  "name": "Quiz band",
  "tag": "div",
  "settings": [
    { "type": "color", "id": "tone", "label": "Background", "default": "#3D4FA3" },
    { "type": "color", "id": "on_tone", "label": "Foreground", "default": "#FFFFFF" },
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "Ritual finder" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Not sure where to start?" },
    { "type": "text", "id": "text", "label": "Text", "default": "Four questions, about a minute. We'll suggest three tonics and build the pack for you." },
    { "type": "text", "id": "button", "label": "Button", "default": "Take the quiz" },
    { "type": "url", "id": "link", "label": "Link" },
    { "type": "text", "id": "chips", "label": "Example answers (comma separated)", "default": "More energy, Better sleep, Easier digestion, Hot drinks, Bright & citrusy, Mornings, Caffeine-free, Calmer afternoons" }
  ],
  "presets": [{ "name": "Quiz band" }]
}
{% endschema %}
`,"/repo/theme/sections/shelf.liquid":`<section class="section container" aria-labelledby="shelf-{{ section.id }}">
  <div class="sec-head">
    <div class="stack" style="--gap:10px">
      <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
      <h2 class="d-1" id="shelf-{{ section.id }}">{{ section.settings.heading | escape }}</h2>
    </div>
    {%- if section.settings.collection != blank -%}
      <a href="{{ section.settings.collection.url }}" class="btn btn--ghost btn--sm">{{ 'general.view_all' | t }}</a>
    {%- endif -%}
  </div>
  <ul role="list" class="tiles" style="--tiles-d: {{ section.settings.columns }}">
    {%- for product in section.settings.collection.products limit: section.settings.limit -%}
      <li>{% render 'product-tile', product: product %}</li>
    {%- endfor -%}
  </ul>
</section>

<style>
  .sec-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: clamp(24px, 3vw, 40px); flex-wrap: wrap; }
</style>

{% schema %}
{
  "name": "Product shelf",
  "tag": "div",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "The tonics" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Six blends, one for every kind of day" },
    { "type": "collection", "id": "collection", "label": "Collection" },
    { "type": "range", "id": "limit", "label": "Products", "min": 2, "max": 12, "step": 1, "default": 6 },
    { "type": "select", "id": "columns", "label": "Columns (desktop)", "options": [{ "value": "3", "label": "3" }, { "value": "4", "label": "4" }], "default": "3" }
  ],
  "presets": [{ "name": "Product shelf" }]
}
{% endschema %}
`,"/repo/theme/sections/steps.liquid":`<section class="section container" aria-labelledby="steps-{{ section.id }}">
  <div class="stack" style="--gap:10px;margin-bottom:clamp(24px,3vw,40px)">
    <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
    <h2 class="d-1" id="steps-{{ section.id }}">{{ section.settings.heading | escape }}</h2>
  </div>
  <ol role="list" class="steps">
    {%- for block in section.blocks -%}
      <li class="step" {{ block.shopify_attributes }}>
        <span class="step__n" aria-hidden="true">{{ forloop.index }}</span>
        <h3 class="d-3">{{ block.settings.title | escape }}</h3>
        <p class="muted">{{ block.settings.text | escape }}</p>
      </li>
    {%- endfor -%}
  </ol>
</section>

<style>
  .steps { display: grid; gap: 16px; }
  .step { display: grid; gap: 10px; padding: 28px; border-radius: var(--r-lg); background: #fff; border: 1.5px solid var(--line); align-content: start; }
  .step__n { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; background: var(--ink); color: var(--paper); font-weight: 700; font-size: 1.25rem; margin-bottom: 8px; }
  .step:nth-child(2) .step__n { background: #F2B233; color: var(--ink); }
  .step:nth-child(3) .step__n { background: #B5412E; }
  @media (min-width: 900px) { .steps { grid-template-columns: repeat(3, 1fr); } }
</style>

{% schema %}
{
  "name": "How it works",
  "tag": "div",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "How the subscription works" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Set it once, change it whenever" }
  ],
  "blocks": [
    { "type": "step", "name": "Step", "settings": [
      { "type": "text", "id": "title", "label": "Title", "default": "Pick your tonics" },
      { "type": "textarea", "id": "text", "label": "Text", "default": "Take the quiz or build a pack of three or more. Bigger packs cost less per stick." }
    ] }
  ],
  "max_blocks": 4,
  "presets": [{ "name": "How it works", "blocks": [{ "type": "step" }, { "type": "step" }, { "type": "step" }] }]
}
{% endschema %}
`,"/repo/theme/snippets/cart-line.liquid":`{%- comment -%} One cart line. - item, index (1-based line number) {%- endcomment -%}
<div class="line" data-line="{{ index }}" data-key="{{ item.key }}" style="{% render 'tone', product: item.product %}">
  <a href="{{ item.url }}" class="line__img" tabindex="-1" aria-hidden="true">
    {%- if item.image -%}{{ item.image | image_url: width: 200 | image_tag: widths: '72, 144, 200', sizes: '72px', alt: '', loading: 'lazy' }}{%- endif -%}
  </a>
  <div>
    <a href="{{ item.url }}" class="line__title">{{ item.product.title | escape }}</a>
    <div class="line__meta xsmall muted">
      {%- unless item.product.has_only_default_variant -%}<span>{{ item.variant.title }}</span>{%- endunless -%}
      {%- if item.selling_plan_allocation -%}
        <span class="sub-tag">{% render 'icon', name: 'repeat' %}{{ item.selling_plan_allocation.selling_plan.name }}</span>
      {%- endif -%}
      {%- for p in item.properties -%}
        {%- assign first_char = p.first | slice: 0 -%}
        {%- comment -%} "Pack" is kept on the order for staff, but the drawer already groups the pack. {%- endcomment -%}
        {%- if first_char != '_' and p.last != blank and p.first != 'Pack' -%}<span>{{ p.first }}: {{ p.last }}</span>{%- endif -%}
      {%- endfor -%}
    </div>
    <div class="line__actions">
      {%- if item.properties['_pack'] == blank -%}
        <div class="qty">
          <button type="button" data-step="-1" aria-label="{{ 'cart.decrease' | t: product: item.product.title | escape }}">{% render 'icon', name: 'minus' %}</button>
          <input type="number" min="0" inputmode="numeric" value="{{ item.quantity }}" data-qty aria-label="{{ 'cart.quantity' | t: product: item.product.title | escape }}">
          <button type="button" data-step="1" aria-label="{{ 'cart.increase' | t: product: item.product.title | escape }}">{% render 'icon', name: 'plus' %}</button>
        </div>
        <button type="button" class="xsmall link muted" data-remove>{{ 'cart.remove' | t }}</button>
      {%- else -%}
        <span class="xsmall muted">\xD7 {{ item.quantity }}</span>
      {%- endif -%}
    </div>
  </div>
  <div class="line__price small">
    {%- if item.original_line_price > item.final_line_price -%}<s class="muted" style="font-weight:400">{{ item.original_line_price | money }}</s><br>{%- endif -%}
    {{ item.final_line_price | money }}
  </div>
</div>
`,"/repo/theme/snippets/cart-lines.liquid":`{%- comment -%}
  Cart lines. Lines sharing a \`_pack\` property are grouped under one heading
  and edited as a unit (remove the pack), because the tier discount depends
  on how many tonics the pack holds. Packs first, then single items.
{%- endcomment -%}
{%- liquid
  assign pack_ids = ','
  for item in cart.items
    assign pid = item.properties['_pack']
    if pid != blank
      assign needle = ',' | append: pid | append: ','
      unless pack_ids contains needle
        assign pack_ids = pack_ids | append: pid | append: ','
      endunless
    endif
  endfor
  assign pack_list = pack_ids | remove_first: ',' | split: ','
-%}

{%- for pack in pack_list -%}
  {%- liquid
    assign pack_count = 0
    assign pack_total = 0
    assign pack_original = 0
    for item in cart.items
      if item.properties['_pack'] == pack
        assign pack_count = pack_count | plus: item.quantity
        assign pack_total = pack_total | plus: item.final_line_price
        assign pack_original = pack_original | plus: item.original_line_price
      endif
    endfor
    assign pack_saving = pack_original | minus: pack_total
    assign pack_saving_money = pack_saving | money
  -%}
  <div class="pack-group" data-pack="{{ pack }}">
    <div class="pack-group__head">
      <div>
        <p class="d-3" style="font-size:var(--t-md)">{{ 'cart.pack_title' | t: count: pack_count }}</p>
        {%- if pack_saving > 0 -%}<p class="xsmall sub-tag">{{ 'cart.pack_saving' | t: amount: pack_saving_money }}</p>{%- endif -%}
      </div>
      <button type="button" class="xsmall link muted" data-remove-pack="{{ pack }}">{{ 'cart.remove_pack' | t }}</button>
    </div>
    {%- for item in cart.items -%}
      {%- if item.properties['_pack'] == pack -%}{% render 'cart-line', item: item, index: forloop.index %}{%- endif -%}
    {%- endfor -%}
  </div>
{%- endfor -%}

{%- for item in cart.items -%}
  {%- if item.properties['_pack'] == blank -%}{% render 'cart-line', item: item, index: forloop.index %}{%- endif -%}
{%- endfor -%}
`,"/repo/theme/snippets/consent-banner.liquid":`{%- comment -%}
  Cookie consent via Shopify's Customer Privacy API. The banner stays hidden
  until the API reports that this visitor's region requires consent, so US
  visitors (no requirement) never see it and EU visitors always do.
{%- endcomment -%}
<consent-banner class="consent" role="dialog" aria-labelledby="consent-title" aria-describedby="consent-text" hidden>
  <p class="d-3" id="consent-title" style="font-size:var(--t-md)">{{ 'consent.title' | t }}</p>
  <p class="small" id="consent-text" style="opacity:.8">{{ 'consent.text' | t }}</p>
  <div class="consent__actions">
    <button type="button" class="btn btn--light btn--sm" data-consent="all">{{ 'consent.accept' | t }}</button>
    <button type="button" class="btn btn--ghost btn--sm" style="--fg:var(--paper)" data-consent="essential">{{ 'consent.decline' | t }}</button>
  </div>
</consent-banner>
`,"/repo/theme/snippets/delivery-estimate.liquid":`{%- comment -%} Delivery estimate and duties note for the customer's country. {%- endcomment -%}
{%- liquid
  assign estimate = ''
  assign lines = settings.delivery_estimates | newline_to_br | split: '<br />'
  for raw in lines
    assign pair = raw | strip | split: ':'
    if pair[0] == localization.country.iso_code
      assign estimate = pair[1] | strip
    endif
  endfor
-%}
<div class="delivery xsmall">
  <span class="delivery__row">{% render 'icon', name: 'truck' %}
    {%- if estimate != '' -%}
      {{ 'products.delivery_to' | t: country: localization.country.name, estimate: estimate }}
    {%- else -%}
      {{ 'products.delivery_generic' | t: country: localization.country.name }}
    {%- endif -%}
  </span>
  {%- if localization.country.iso_code != 'US' and settings.duties_note != blank -%}
    <span class="muted">{{ settings.duties_note }}</span>
  {%- endif -%}
</div>
`,"/repo/theme/snippets/icon.liquid":`{%- case name -%}
  {%- when 'arrow' -%}<svg class="icon arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 4.5l5.5 5.5-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
  {%- when 'bag' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 6.5h11l-.8 10a1.5 1.5 0 0 1-1.5 1.4H6.8a1.5 1.5 0 0 1-1.5-1.4l-.8-10zM7.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
  {%- when 'menu' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6.5h14M3 13.5h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  {%- when 'close' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  {%- when 'plus' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true" style="width:16px;height:16px"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  {%- when 'minus' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true" style="width:16px;height:16px"><path d="M4 10h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  {%- when 'repeat' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true" style="width:16px;height:16px"><path d="M4 9a5 5 0 0 1 8.5-3.5L15 8M16 11a5 5 0 0 1-8.5 3.5L5 12M15 4v4h-4M5 16v-4h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
  {%- when 'check' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true" style="width:16px;height:16px"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  {%- when 'truck' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M2.5 5.5h9v8h-9zM11.5 8.5h3.2l2.8 2.8v2.2h-6M5.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM14.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
{%- endcase -%}
`,"/repo/theme/snippets/meta-tags.liquid":`{%- liquid
  assign og_title = page_title | default: shop.name
  assign og_type = 'website'
  if request.page_type == 'product'
    assign og_type = 'product'
  endif
-%}
<meta property="og:site_name" content="{{ shop.name }}">
<meta property="og:url" content="{{ canonical_url }}">
<meta property="og:title" content="{{ og_title | escape }}">
<meta property="og:type" content="{{ og_type }}">
<meta property="og:description" content="{{ page_description | default: shop.description | escape }}">
{%- if page_image -%}
  <meta property="og:image" content="https:{{ page_image | image_url: width: 1200 }}">
{%- endif -%}
{%- if request.page_type == 'product' -%}
  <meta property="og:price:amount" content="{{ product.price | money_without_currency | strip_html }}">
  <meta property="og:price:currency" content="{{ cart.currency.iso_code }}">
{%- endif -%}
<meta name="twitter:card" content="summary_large_image">
`,"/repo/theme/snippets/price.liquid":`{%- comment -%}
  Price for a product, optionally with its best subscription price.
  - product, variant (optional), show_subscription (bool)
{%- endcomment -%}
{%- liquid
  assign v = variant | default: product.selected_or_first_available_variant
  assign one_time = v.price | money
  assign sub_price = nil
  if show_subscription and v.selling_plan_allocations.size > 0
    assign best = v.selling_plan_allocations | sort: 'price' | first
    assign sub_price = best.price | money
  endif
-%}
<span class="price">
  {%- if v.compare_at_price > v.price -%}<s>{{ v.compare_at_price | money }}</s>{%- endif -%}
  <span>{{ one_time }}</span>
  {%- if sub_price -%}
    <span class="xsmall" style="font-weight:500;opacity:.85">{{ 'products.subscribe_from' | t: price: sub_price }}</span>
  {%- endif -%}
</span>
`,"/repo/theme/snippets/product-tile.liquid":`{%- comment -%}
  Colour-blocked product tile. - product, eager (bool)
{%- endcomment -%}
{%- liquid
  assign img = product.featured_media.preview_image
  assign local_name = product.metafields.racik.local_name.value
-%}
<article class="tile" style="{% render 'tone', product: product %}">
  <div class="tile__media">
    {%- if img -%}
      {%- if eager -%}
        {{ img | image_url: width: 900 | image_tag: widths: '300, 450, 600, 900', sizes: '(min-width: 900px) 30vw, 50vw', alt: '', loading: 'eager', fetchpriority: 'high' }}
      {%- else -%}
        {{ img | image_url: width: 900 | image_tag: widths: '300, 450, 600, 900', sizes: '(min-width: 900px) 30vw, 50vw', alt: '', loading: 'lazy', decoding: 'async' }}
      {%- endif -%}
    {%- else -%}
      {{ 'product-1' | placeholder_svg_tag }}
    {%- endif -%}
  </div>
  <div class="tile__badges">
    {%- if product.available == false -%}
      <span class="chip">{{ 'products.sold_out' | t }}</span>
    {%- elsif product.selling_plan_groups.size > 0 -%}
      <span class="chip">{% render 'icon', name: 'repeat' %}{{ settings.subscribe_badge }}</span>
    {%- endif -%}
  </div>
  <div class="tile__body">
    {%- if local_name != blank -%}<span class="small muted">{{ local_name }}</span>{%- endif -%}
    <a class="tile__name" href="{{ product.url }}">{{ product.title | escape }}</a>
    {%- if product.metafields.racik.benefit != blank -%}
      <span class="small muted">{{ product.metafields.racik.benefit.value }}</span>
    {%- endif -%}
    <div class="tile__row small">
      {% render 'price', product: product %}
      {%- if product.metafields.racik.servings != blank -%}
        <span class="muted">{{ 'products.servings' | t: count: product.metafields.racik.servings.value }}</span>
      {%- endif -%}
    </div>
  </div>
</article>
`,"/repo/theme/snippets/shipping-bar.liquid":`{%- comment -%}
  Free-shipping progress in the customer's own currency. Thresholds are set
  per currency (one per market), so EUR shoppers see a real EUR target
  instead of a converted USD number that changes with the exchange rate.
{%- endcomment -%}
{%- liquid
  assign threshold = 0
  assign lines = settings.free_shipping_thresholds | newline_to_br | split: '<br />'
  for raw in lines
    assign pair = raw | strip | split: ':'
    if pair[0] == cart.currency.iso_code
      assign threshold = pair[1] | strip | times: 100
    endif
  endfor
-%}
{%- if threshold > 0 and cart.item_count > 0 -%}
  {%- liquid
    assign remaining = threshold | minus: cart.total_price
    assign progress = cart.total_price | times: 1.0 | divided_by: threshold
    if progress > 1
      assign progress = 1
    endif
    assign remaining_money = remaining | money
  -%}
  <div class="ship-bar small">
    <span>
      {%- if remaining > 0 -%}{{ 'cart.shipping_remaining' | t: amount: remaining_money }}{%- else -%}<strong>{{ 'cart.shipping_free' | t }}</strong>{%- endif -%}
    </span>
    <div class="ship-bar__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{ progress | times: 100 | round }}" aria-label="{{ 'cart.shipping_progress' | t }}">
      <div class="ship-bar__fill" style="--p: {{ progress }}"></div>
    </div>
  </div>
{%- endif -%}
`,"/repo/theme/snippets/supplement-facts.liquid":`{%- comment -%}
  FDA-style Supplement Facts panel from the racik.supplement_facts JSON
  metafield: { serving_size, servings, rows: [{ name, amount, dv, indent }], blend: { name, amount, items }, footnotes }
{%- endcomment -%}
{%- assign f = product.metafields.racik.supplement_facts.value -%}
{%- if f -%}
  <figure class="facts" aria-label="{{ 'products.facts_title' | t }}">
    <p class="facts__title">{{ 'products.facts_title' | t }}</p>
    <p class="facts__serving">{{ 'products.facts_serving' | t: size: f.serving_size }}<br>{{ 'products.facts_servings' | t: count: f.servings }}</p>
    <table class="facts__table">
      <thead>
        <tr><th scope="col"><span class="visually-hidden">{{ 'products.facts_nutrient' | t }}</span></th><th scope="col">{{ 'products.facts_amount' | t }}</th><th scope="col">{{ 'products.facts_dv' | t }}</th></tr>
      </thead>
      <tbody>
        {%- for row in f.rows -%}
          <tr{% if row.indent %} class="indent"{% endif %}>
            <th scope="row">{{ row.name }}</th><td>{{ row.amount }}</td><td>{{ row.dv | default: '\u2020' }}</td>
          </tr>
        {%- endfor -%}
        {%- if f.blend -%}
          <tr class="facts__blend"><th scope="row">{{ f.blend.name }}</th><td>{{ f.blend.amount }}</td><td>\u2020</td></tr>
          <tr class="facts__items"><td colspan="3">{{ f.blend.items | join: ', ' }}</td></tr>
        {%- endif -%}
      </tbody>
    </table>
    <figcaption class="facts__foot">
      {%- for note in f.footnotes -%}<span>{{ note }}</span>{%- endfor -%}
    </figcaption>
  </figure>
{%- endif -%}
`,"/repo/theme/snippets/theme-tokens.liquid":`{%- comment -%}
  Setting-driven tokens, inline so they exist before base.css. The fallback
  face is metric-matched to Bricolage so the font swap doesn't shift layout.
{%- endcomment -%}
<style>
  @font-face {
    font-family: 'Bricolage';
    src: url('{{ 'bricolage-var.woff2' | asset_url }}') format('woff2');
    font-weight: 200 800;
    font-display: swap;
  }
  @font-face {
    font-family: 'Bricolage Fallback';
    src: local('Arial'), local('Helvetica Neue');
    size-adjust: 103%;
    ascent-override: 90%;
    descent-override: 24%;
    line-gap-override: 0%;
  }
  :root {
    --paper: {{ settings.color_paper }};
    --ink: {{ settings.color_ink }};
    --muted: {{ settings.color_muted }};
    --line: {{ settings.color_line }};
    --leaf: {{ settings.color_leaf }};
    --ink-rgb: {{ settings.color_ink.red }}, {{ settings.color_ink.green }}, {{ settings.color_ink.blue }};
  }
</style>
`,"/repo/theme/snippets/tone.liquid":`{%- comment -%}
  Outputs CSS custom properties for a product's colour: --tone and a
  readable foreground (--on-tone), picked from the colour's brightness so
  merchants can add a new tonic without worrying about contrast. The 140
  cut-off keeps mid-tones like amber on dark text (white would be ~3:1).
{%- endcomment -%}
{%- liquid
  assign tone = product.metafields.racik.color.value | default: settings.color_leaf
  assign brightness = tone | color_brightness
  if brightness > 140
    assign on_tone = settings.color_ink
  else
    assign on_tone = '#FFFFFF'
  endif
-%}
--tone: {{ tone }}; --on-tone: {{ on_tone }};
`,"/repo/theme/templates/404.json":`{
  "sections": { "main": { "type": "main-404", "settings": {} } },
  "order": ["main"]
}
`,"/repo/theme/templates/cart.json":`{
  "sections": { "main": { "type": "main-cart", "settings": {} } },
  "order": ["main"]
}
`,"/repo/theme/templates/collection.json":`{
  "sections": { "main": { "type": "main-collection", "settings": {} } },
  "order": ["main"]
}
`,"/repo/theme/templates/index.json":`{
  "sections": {
    "hero": {
      "type": "hero",
      "blocks": {
        "p1": { "type": "proof", "settings": { "text": "Grown by 40 farms in Java & Bali" } },
        "p2": { "type": "proof", "settings": { "text": "Third-party tested for heavy metals" } },
        "p3": { "type": "proof", "settings": { "text": "Ships to 30+ countries" } }
      },
      "block_order": ["p1", "p2", "p3"],
      "settings": { "image": "shopify://shop_images/hero-racik.png", "primary_link": "/pages/quiz", "secondary_link": "/pages/build-a-pack" }
    },
    "shelf": { "type": "shelf", "settings": { "collection": "tonics", "limit": 6, "columns": "3" } },
    "quiz": { "type": "quiz-band", "settings": { "link": "/pages/quiz" } },
    "steps": {
      "type": "steps",
      "blocks": {
        "s1": { "type": "step", "settings": { "title": "Pick your tonics", "text": "Take the quiz or build a pack of three or more. Bigger packs cost less per stick." } },
        "s2": { "type": "step", "settings": { "title": "One stick a day", "text": "Stir into 250 ml of water, hot or iced. A 30-stick pouch lasts a month." } },
        "s3": { "type": "step", "settings": { "title": "Change it anytime", "text": "Skip a delivery, swap a flavour or pause from your account. Cancel in two clicks." } }
      },
      "block_order": ["s1", "s2", "s3"],
      "settings": {}
    },
    "ingredients": { "type": "ingredients", "settings": {} },
    "compare": {
      "type": "compare",
      "blocks": {
        "r1": { "type": "row", "settings": { "feature": "Price per stick", "one_time": "$1.13", "subscription": "$0.96" } },
        "r2": { "type": "row", "settings": { "feature": "Pack of 5 or more", "one_time": "15% off", "subscription": "15% off, on top" } },
        "r3": { "type": "row", "settings": { "feature": "Shipping", "one_time": "Free over $50", "subscription": "Always free in the US" } },
        "r4": { "type": "row", "settings": { "feature": "Skip, swap or pause", "one_time": "\u2014", "subscription": "Anytime, from your account" } },
        "r5": { "type": "row", "settings": { "feature": "Seasonal blends", "one_time": "When in stock", "subscription": "First access" } }
      },
      "block_order": ["r1", "r2", "r3", "r4", "r5"],
      "settings": {}
    },
    "faq": {
      "type": "faq",
      "blocks": {
        "q1": { "type": "qa", "settings": { "q": "What is jamu?", "a": "<p>Jamu is Indonesia's herbal drink tradition, made from roots, barks and leaves like turmeric and ginger. Recipes are passed down in families and sold fresh by street vendors, the <em>mbok jamu</em>, across Java.</p>" } },
        "q2": { "type": "qa", "settings": { "q": "How do I take it?", "a": "<p>Stir one stick into 250 ml of water, hot or cold. It dissolves in about ten seconds. Most people take it in the morning.</p>" } },
        "q3": { "type": "qa", "settings": { "q": "Do you ship to my country?", "a": "<p>We ship to the US, Canada, the UK, the EU and Australia. Prices show in your currency, and duties are paid at checkout, so there's nothing extra to pay on delivery.</p>" } },
        "q4": { "type": "qa", "settings": { "q": "Can I pause or cancel my subscription?", "a": "<p>Yes. Skip, swap, pause or cancel from your account page at any time. There's no minimum number of deliveries.</p>" } },
        "q5": { "type": "qa", "settings": { "q": "Is it safe during pregnancy?", "a": "<p>Some traditional ingredients are not recommended during pregnancy. Please check with your doctor before taking any herbal supplement.</p>" } }
      },
      "block_order": ["q1", "q2", "q3", "q4", "q5"],
      "settings": {}
    }
  },
  "order": ["hero", "shelf", "quiz", "steps", "ingredients", "compare", "faq"]
}
`,"/repo/theme/templates/metaobject/ingredient.json":`{
  "sections": {
    "main": { "type": "main-ingredient", "settings": {} },
    "shelf": { "type": "shelf", "settings": { "eyebrow": "Keep exploring", "heading": "All six tonics", "collection": "tonics", "limit": 3, "columns": "3" } }
  },
  "order": ["main", "shelf"]
}
`,"/repo/theme/templates/page.json":`{
  "sections": { "main": { "type": "main-page", "settings": {} } },
  "order": ["main"]
}
`,"/repo/theme/templates/page.pack.json":`{
  "sections": { "main": { "type": "main-pack", "settings": { "collection": "tonics", "max_items": 8 } } },
  "order": ["main"]
}
`,"/repo/theme/templates/page.quiz.json":`{
  "sections": {
    "main": {
      "type": "main-quiz",
      "blocks": {
        "q1": { "type": "question", "settings": { "question": "What would you like more of?", "help": "Pick the one that matters most right now.", "multi": false,
          "answers": "Steady energy | goal:energy\\nCalmer evenings | goal:calm\\nEasier digestion | goal:digest\\nClearer focus | goal:focus\\nA warming boost | goal:warmth\\nThat healthy glow | goal:glow" } },
        "q2": { "type": "question", "settings": { "question": "When would you drink it?", "multi": false,
          "answers": "First thing in the morning | time:morning\\nAfter lunch | time:afternoon\\nIn the evening | time:evening" } },
        "q3": { "type": "question", "settings": { "question": "Hot or iced?", "multi": false,
          "answers": "Hot, like tea | serve:hot\\nIced, or with sparkling water | serve:cold\\nEither works | serve:hot, serve:cold" } },
        "q4": { "type": "question", "settings": { "question": "Which flavours do you enjoy?", "help": "Choose as many as you like.", "multi": true,
          "answers": "Earthy & golden | taste:earthy\\nBright & citrusy | taste:bright\\nSpicy & warming | taste:spicy\\nFloral & herbal | taste:floral\\nSoft & creamy | taste:creamy" } }
      },
      "block_order": ["q1", "q2", "q3", "q4"],
      "settings": { "collection": "tonics", "pack_page": "build-a-pack" }
    }
  },
  "order": ["main"]
}
`,"/repo/theme/templates/product.json":`{
  "sections": {
    "main": { "type": "main-product", "settings": { "pack_page": "build-a-pack" } },
    "shelf": { "type": "shelf", "settings": { "eyebrow": "Pairs well", "heading": "Rotate through the week", "collection": "tonics", "limit": 3, "columns": "3" } }
  },
  "order": ["main", "shelf"]
}
`,"/repo/scripts/catalog.json":`{
  "tonics": [
    {
      "handle": "glow",
      "title": "Glow",
      "local": "Kunyit Asam",
      "benefit": "Turmeric and tamarind for skin that looks rested",
      "color": "#F2B233",
      "price": 34,
      "price15": 19,
      "tags": [
        "goal:glow",
        "time:morning",
        "serve:cold",
        "taste:bright",
        "taste:earthy"
      ],
      "ingredients": [
        "turmeric",
        "tamarind"
      ],
      "ritual": "Stir one stick into 250 ml of cold water or sparkling water.\\nAdd ice and a squeeze of lime.\\nBest in the morning, with or without food.",
      "description": "<p>The most loved jamu in Java. Fresh turmeric root and tart tamarind, sweetened with a little palm sugar, as the mbok jamu still make it each morning in Solo.</p>",
      "facts": {
        "serving_size": "1 stick (3 g)",
        "servings": 30,
        "rows": [
          {
            "name": "Calories",
            "amount": "10",
            "dv": ""
          },
          {
            "name": "Total Carbohydrate",
            "amount": "2 g",
            "dv": "1%*"
          },
          {
            "name": "Total Sugars",
            "amount": "1 g",
            "dv": "\u2020",
            "indent": true
          }
        ],
        "blend": {
          "name": "Kunyit Asam blend",
          "amount": "2.6 g",
          "items": [
            "Turmeric rhizome (Curcuma longa)",
            "Tamarind fruit",
            "Coconut palm sugar",
            "Black pepper"
          ]
        },
        "footnotes": [
          "*Percent Daily Values are based on a 2,000 calorie diet.",
          "\u2020Daily Value not established."
        ]
      }
    },
    {
      "handle": "calm",
      "title": "Calm",
      "local": "Beras Kencur",
      "benefit": "Rice and aromatic ginger to wind down the evening",
      "color": "#EADBB6",
      "price": 34,
      "price15": 19,
      "tags": [
        "goal:calm",
        "time:evening",
        "serve:hot",
        "taste:creamy"
      ],
      "ingredients": [
        "rice",
        "aromatic-ginger"
      ],
      "ritual": "Stir one stick into 250 ml of warm water or warm oat milk.\\nSip slowly an hour before bed.",
      "description": "<p>Toasted rice and kencur, a gentle, camphor-bright ginger. Soft, a little sweet, and the jamu Javanese grandmothers give children.</p>",
      "facts": {
        "serving_size": "1 stick (3 g)",
        "servings": 30,
        "rows": [
          {
            "name": "Calories",
            "amount": "15",
            "dv": ""
          },
          {
            "name": "Total Carbohydrate",
            "amount": "3 g",
            "dv": "1%*"
          },
          {
            "name": "Total Sugars",
            "amount": "1 g",
            "dv": "\u2020",
            "indent": true
          }
        ],
        "blend": {
          "name": "Beras Kencur blend",
          "amount": "2.6 g",
          "items": [
            "Toasted rice flour",
            "Aromatic ginger rhizome (Kaempferia galanga)",
            "Coconut palm sugar",
            "Pandan leaf"
          ]
        },
        "footnotes": [
          "*Percent Daily Values are based on a 2,000 calorie diet.",
          "\u2020Daily Value not established."
        ]
      }
    },
    {
      "handle": "digest",
      "title": "Digest",
      "local": "Temulawak",
      "benefit": "Javanese turmeric for an easier afternoon",
      "color": "#D9822B",
      "price": 34,
      "price15": 19,
      "tags": [
        "goal:digest",
        "time:afternoon",
        "serve:hot",
        "taste:earthy"
      ],
      "ingredients": [
        "javanese-turmeric",
        "turmeric"
      ],
      "ritual": "Stir one stick into 250 ml of hot water after lunch.\\nA slice of fresh ginger makes it sharper.",
      "description": "<p>Temulawak is turmeric's bolder cousin, grown on the slopes of West Java. Earthy, slightly bitter, and traditionally taken after a heavy meal.</p>",
      "facts": {
        "serving_size": "1 stick (3 g)",
        "servings": 30,
        "rows": [
          {
            "name": "Calories",
            "amount": "10",
            "dv": ""
          },
          {
            "name": "Total Carbohydrate",
            "amount": "2 g",
            "dv": "1%*"
          },
          {
            "name": "Total Sugars",
            "amount": "1 g",
            "dv": "\u2020",
            "indent": true
          }
        ],
        "blend": {
          "name": "Temulawak blend",
          "amount": "2.6 g",
          "items": [
            "Javanese turmeric rhizome (Curcuma zanthorrhiza)",
            "Turmeric rhizome",
            "Coconut palm sugar"
          ]
        },
        "footnotes": [
          "*Percent Daily Values are based on a 2,000 calorie diet.",
          "\u2020Daily Value not established."
        ]
      }
    },
    {
      "handle": "warmth",
      "title": "Warmth",
      "local": "Jahe Merah",
      "benefit": "Red ginger and cinnamon for cold mornings",
      "color": "#B5412E",
      "price": 34,
      "price15": 19,
      "tags": [
        "goal:warmth",
        "goal:energy",
        "time:morning",
        "serve:hot",
        "taste:spicy"
      ],
      "ingredients": [
        "red-ginger",
        "lemongrass"
      ],
      "ritual": "Stir one stick into 250 ml of hot water.\\nAdd honey if you like it sweeter.",
      "description": "<p>Red ginger is smaller and hotter than the common kind. We pair it with lemongrass and a little cinnamon for a drink that warms from the first sip.</p>",
      "facts": {
        "serving_size": "1 stick (3 g)",
        "servings": 30,
        "rows": [
          {
            "name": "Calories",
            "amount": "10",
            "dv": ""
          },
          {
            "name": "Total Carbohydrate",
            "amount": "2 g",
            "dv": "1%*"
          },
          {
            "name": "Total Sugars",
            "amount": "1 g",
            "dv": "\u2020",
            "indent": true
          }
        ],
        "blend": {
          "name": "Jahe Merah blend",
          "amount": "2.6 g",
          "items": [
            "Red ginger rhizome (Zingiber officinale var. rubrum)",
            "Lemongrass",
            "Cinnamon bark",
            "Coconut palm sugar"
          ]
        },
        "footnotes": [
          "*Percent Daily Values are based on a 2,000 calorie diet.",
          "\u2020Daily Value not established."
        ]
      }
    },
    {
      "handle": "focus",
      "title": "Focus",
      "local": "Sereh Telang",
      "benefit": "Lemongrass and butterfly pea for clear afternoons",
      "color": "#3D4FA3",
      "price": 36,
      "price15": 20,
      "tags": [
        "goal:focus",
        "time:afternoon",
        "serve:cold",
        "taste:floral",
        "taste:bright"
      ],
      "ingredients": [
        "butterfly-pea",
        "lemongrass"
      ],
      "ritual": "Stir one stick into 250 ml of cold water. It turns deep blue.\\nAdd lemon and watch it change to violet.",
      "description": "<p>Butterfly pea flowers from Bali, dried in the sun, with fresh lemongrass. Bright, floral, caffeine-free, and it changes colour when you add citrus.</p>",
      "facts": {
        "serving_size": "1 stick (3 g)",
        "servings": 30,
        "rows": [
          {
            "name": "Calories",
            "amount": "5",
            "dv": ""
          },
          {
            "name": "Total Carbohydrate",
            "amount": "1 g",
            "dv": "<1%*"
          },
          {
            "name": "Total Sugars",
            "amount": "<1 g",
            "dv": "\u2020",
            "indent": true
          }
        ],
        "blend": {
          "name": "Sereh Telang blend",
          "amount": "2.6 g",
          "items": [
            "Butterfly pea flower (Clitoria ternatea)",
            "Lemongrass (Cymbopogon citratus)",
            "Lime peel",
            "Coconut palm sugar"
          ]
        },
        "footnotes": [
          "*Percent Daily Values are based on a 2,000 calorie diet.",
          "\u2020Daily Value not established."
        ]
      }
    },
    {
      "handle": "energy",
      "title": "Energy",
      "local": "Pandan Kelor",
      "benefit": "Moringa and pandan for a steady, caffeine-free lift",
      "color": "#4A7A2E",
      "price": 36,
      "price15": 20,
      "tags": [
        "goal:energy",
        "time:morning",
        "serve:cold",
        "taste:floral",
        "taste:earthy"
      ],
      "ingredients": [
        "moringa",
        "pandan"
      ],
      "ritual": "Shake one stick with 250 ml of cold water or coconut water.\\nGood before a walk or a workout.",
      "description": "<p>Moringa leaves from Madura, dried at low heat to keep their colour, with pandan for a soft vanilla note. Grassy, green and gently sweet.</p>",
      "facts": {
        "serving_size": "1 stick (3 g)",
        "servings": 30,
        "rows": [
          {
            "name": "Calories",
            "amount": "10",
            "dv": ""
          },
          {
            "name": "Total Carbohydrate",
            "amount": "2 g",
            "dv": "1%*"
          },
          {
            "name": "Total Sugars",
            "amount": "1 g",
            "dv": "\u2020",
            "indent": true
          }
        ],
        "blend": {
          "name": "Pandan Kelor blend",
          "amount": "2.6 g",
          "items": [
            "Moringa leaf (Moringa oleifera)",
            "Pandan leaf (Pandanus amaryllifolius)",
            "Coconut palm sugar"
          ]
        },
        "footnotes": [
          "*Percent Daily Values are based on a 2,000 calorie diet.",
          "\u2020Daily Value not established."
        ]
      }
    }
  ],
  "ingredients": [
    {
      "handle": "turmeric",
      "name": "Turmeric",
      "local_name": "Kunyit",
      "latin_name": "Curcuma longa",
      "origin": "Central Java",
      "harvest": "May to August",
      "color": "#E8A21F",
      "story": "Kunyit is the backbone of jamu. Our growers in Karanganyar lift the rhizomes after the plant's leaves yellow, wash them in spring water and slice them thin to dry in the sun for four days.\\nFresh turmeric is used in almost every Javanese kitchen, from curries to the yellow rice cooked for celebrations."
    },
    {
      "handle": "tamarind",
      "name": "Tamarind",
      "local_name": "Asam Jawa",
      "latin_name": "Tamarindus indica",
      "origin": "East Java",
      "harvest": "January to March",
      "color": "#8A5A35",
      "story": "Tamarind trees line the old roads of East Java. The sticky pulp gives kunyit asam its sourness, balancing the earthiness of turmeric.\\nWe buy from a women's cooperative in Pasuruan that hand-shells every pod."
    },
    {
      "handle": "aromatic-ginger",
      "name": "Aromatic ginger",
      "local_name": "Kencur",
      "latin_name": "Kaempferia galanga",
      "origin": "Central Java",
      "harvest": "Year round",
      "color": "#C9B98E",
      "story": "Kencur is a small, low-growing ginger with a camphor-bright smell. It's the defining flavour of beras kencur and a common remedy for a sore throat."
    },
    {
      "handle": "rice",
      "name": "Rice",
      "local_name": "Beras",
      "latin_name": "Oryza sativa",
      "origin": "Tabanan, Bali",
      "harvest": "March and September",
      "color": "#E9DFC6",
      "story": "We toast heirloom red and white rice from Jatiluwih's terraces until it smells like popcorn, then mill it fine. It gives beras kencur its body."
    },
    {
      "handle": "javanese-turmeric",
      "name": "Javanese turmeric",
      "local_name": "Temulawak",
      "latin_name": "Curcuma zanthorrhiza",
      "origin": "West Java",
      "harvest": "June to September",
      "color": "#D9822B",
      "story": "Temulawak grows wild on the forest edges around Bogor. Larger and more bitter than common turmeric, it has been taken after meals in Java for centuries."
    },
    {
      "handle": "red-ginger",
      "name": "Red ginger",
      "local_name": "Jahe Merah",
      "latin_name": "Zingiber officinale var. rubrum",
      "origin": "Central Java",
      "harvest": "August to October",
      "color": "#B5412E",
      "story": "Red ginger has smaller rhizomes with a pink skin and much more heat than the yellow kind. Farmers in Boyolali plant it between rows of chilli."
    },
    {
      "handle": "lemongrass",
      "name": "Lemongrass",
      "local_name": "Sereh",
      "latin_name": "Cymbopogon citratus",
      "origin": "Bali",
      "harvest": "Year round",
      "color": "#A3B04F",
      "story": "Grown in the same family gardens as the butterfly pea, lemongrass is cut every few weeks and dried in the shade so it keeps its oils."
    },
    {
      "handle": "butterfly-pea",
      "name": "Butterfly pea",
      "local_name": "Bunga Telang",
      "latin_name": "Clitoria ternatea",
      "origin": "Gianyar, Bali",
      "harvest": "Year round",
      "color": "#3D4FA3",
      "story": "The deep blue flowers climb fences across Bali. Picked each morning and dried in the sun, they colour rice cakes, teas and our Focus blend. Add citrus and the blue turns violet."
    },
    {
      "handle": "moringa",
      "name": "Moringa",
      "local_name": "Kelor",
      "latin_name": "Moringa oleifera",
      "origin": "Madura",
      "harvest": "Year round",
      "color": "#5B8C3A",
      "story": "Kelor grows fast in Madura's dry soil. Leaves are stripped by hand and dried below 40\xB0C to keep their green colour."
    },
    {
      "handle": "pandan",
      "name": "Pandan",
      "local_name": "Pandan Wangi",
      "latin_name": "Pandanus amaryllifolius",
      "origin": "Bali",
      "harvest": "Year round",
      "color": "#2F7A4A",
      "story": "Pandan gives Indonesian sweets their soft, vanilla-like smell. A few leaves knotted into the rice pot is how most Balinese cooks use it."
    }
  ],
  "accessory": {
    "handle": "ritual-glass",
    "title": "Ritual Glass",
    "local": "Gelas",
    "benefit": "Hand-blown in Yogyakarta, 300 ml",
    "color": "#9DB8B0",
    "price": 24,
    "description": "<p>A thick, short tumbler made by a family glassworks in Yogyakarta from recycled bottles. Each one has small bubbles, and no two are the same.</p>",
    "tags": [
      "accessory"
    ]
  },
  "tiers": [
    {
      "min": 3,
      "percentage": 10
    },
    {
      "min": 5,
      "percentage": 15
    }
  ],
  "subscription": {
    "name": "Subscribe & save",
    "plans": [
      30,
      60
    ],
    "percentage": 15
  }
}`,"/repo/design/out/calm-glass.png":"","/repo/design/out/calm-pouch.png":"","/repo/design/out/calm-sticks.png":"","/repo/design/out/digest-glass.png":"","/repo/design/out/digest-pouch.png":"","/repo/design/out/digest-sticks.png":"","/repo/design/out/energy-glass.png":"","/repo/design/out/energy-pouch.png":"","/repo/design/out/energy-sticks.png":"","/repo/design/out/focus-glass.png":"","/repo/design/out/focus-pouch.png":"","/repo/design/out/focus-sticks.png":"","/repo/design/out/glow-glass.png":"","/repo/design/out/glow-pouch.png":"","/repo/design/out/glow-sticks.png":"","/repo/design/out/hero-racik.png":"","/repo/design/out/ingredient-aromatic-ginger.png":"","/repo/design/out/ingredient-butterfly-pea.png":"","/repo/design/out/ingredient-javanese-turmeric.png":"","/repo/design/out/ingredient-lemongrass.png":"","/repo/design/out/ingredient-moringa.png":"","/repo/design/out/ingredient-pandan.png":"","/repo/design/out/ingredient-red-ginger.png":"","/repo/design/out/ingredient-rice.png":"","/repo/design/out/ingredient-tamarind.png":"","/repo/design/out/ingredient-turmeric.png":"","/repo/design/out/ritual-glass.png":"","/repo/design/out/warmth-glass.png":"","/repo/design/out/warmth-pouch.png":"","/repo/design/out/warmth-sticks.png":""};var he=U,ht=t=>t instanceof URL?t.pathname:String(t).replace(/^file:\/\//,""),Le=t=>{let e=ht(t);if(!(e in he)){let n=new Error(`ENOENT: ${e}`);throw n.code="ENOENT",n}return he[e]},X=t=>Le(t),fe=t=>ht(t)in he,ft=async t=>Le(t),Bn=t=>(String(t).match(/\.[^./]*$/)||[""])[0],gt=t=>ht(t),mt=null,Nn=t=>(mt=t,{listen:()=>{}});globalThis.process??={env:{}};globalThis.Buffer??={concat:t=>{let e=new Uint8Array(t.reduce((s,i)=>s+i.length,0)),n=0;for(let s of t)e.set(s,n),n+=s.length;return{toString:()=>new TextDecoder().decode(e)}}};var Mn={sep:"/",dirname:t=>t.replace(/\/[^/]*$/,""),resolve:(t,e,n)=>{let s=e.endsWith(n)?e:e+n;return s.startsWith("/")?s:`${t.replace(/\/$/,"")}/${s}`},contains:(t,e)=>e.startsWith(t),exists:async t=>t in he,existsSync:t=>t in he,readFile:async t=>Le(t),readFileSync:t=>Le(t)};var O=class{constructor(e,n,s,i,r){this.kind=e,this.input=n,this.begin=s,this.end=i,this.file=r}getText(){return this.input.slice(this.begin,this.end)}getPosition(){let[e,n]=[1,1];for(let s=0;s<this.begin;s++)this.input[s]===`
`?(e++,n=1):n++;return[e,n]}size(){return this.end-this.begin}},j=class{liquidMethodMissing(e,n){}},Ks=Object.prototype.toString,In=String.prototype.toLowerCase,Ke=Object.hasOwnProperty;function g(t){return typeof t=="string"}function k(t){return typeof t=="function"}function ei(t){return t&&k(t.then)}function De(t){return t&&k(t.next)&&k(t.throw)&&k(t.return)}function u(t){return t=f(t),g(t)?t:v(t)?"":x(t)?t.map(e=>u(e)).join(""):String(t)}function Se(t,e,n){if(e<0&&(e=t.length+e),!(n&&!Ke.call(t,e)))return t[e]}function Te(t){return t=f(t),x(t)?t:g(t)&&t.length>0?[t]:ni(t)?Array.from(t):et(t)?Object.keys(t).map(e=>[e,t[e]]):[]}function q(t){return t=f(t),v(t)?[]:x(t)?t:[t]}function f(t){return t instanceof j&&k(t.valueOf)?t.valueOf():t}function bt(t){return+f(t)||0}function qe(t){return typeof t=="number"}function ds(t){return t&&k(t.toLiquid)?ds(t.toLiquid()):t}function v(t){return t==null}function ti(t){return t===void 0}function x(t){return Ks.call(t)==="[object Array]"}function us(t){return t&&qe(t.length)}function ni(t){return et(t)&&Symbol.iterator in t}function Vn(t,e){t=t||{};for(let n in t)if(Ke.call(t,n)&&e(t[n],n,t)===!1)break;return t}function si(t){return t[t.length-1]}function et(t){let e=typeof t;return t!==null&&(e==="object"||e==="function")}function ps(t,e,n=1){let s=[];for(let i=t;i<e;i+=n)s.push(i);return s}function de(t,e,n=" "){return hs(t,e,n,(s,i)=>i+s)}function ii(t,e,n=" "){return hs(t,e,n,(s,i)=>s+i)}function hs(t,e,n,s){t=String(t);let i=e-t.length;return i<=0?t:s(t,n.repeat(i))}function fs(t){return t}function ri(t){return[...t].some(n=>n>="a"&&n<="z")?t.toUpperCase():t.toLowerCase()}function ai(t,e){return t.length>e?t.slice(0,e-3)+"...":t}function oi(t,e){return v(t)&&v(e)?0:v(t)?1:v(e)||t<e?-1:t>e?1:0}function li(t,e){return v(t)&&v(e)?0:v(t)?1:v(e)||(t=In.call(t),e=In.call(e),t<e)?-1:t>e?1:0}function tt(t){return function(...e){return t.call(this,...e.map(f))}}function D(t){return function(...e){return t.call(this,...e.map(bt))}}function*Ae(t){let e=new Set;for(let n of t){let s=JSON.stringify(n);e.has(s)||(e.add(s),yield n)}}var Un="__liquidClass__",V=class extends Error{constructor(e,n){super(typeof e=="string"?e:e.message),this.context="",typeof e!="string"&&Object.defineProperty(this,"originalError",{value:e,enumerable:!1}),Object.defineProperty(this,"token",{value:n,enumerable:!1}),Object.defineProperty(this,Un,{value:"LiquidError",enumerable:!1})}update(){Object.defineProperty(this,"context",{value:ci(this.token),enumerable:!1}),this.message=di(this.message,this.token),this.stack=this.message+`
`+this.context+`
`+this.stack,this.originalError&&(this.stack+=`
From `+this.originalError.stack)}static is(e){return e?.[Un]==="LiquidError"}},_t=class extends V{constructor(e,n){super(e,n),this.name="TokenizationError",super.update()}},wt=class extends V{constructor(e,n){super(e,n),this.name="ParseError",this.message=e.message,super.update()}},vt=class extends V{constructor(e,n){super(e,n.token),this.name="RenderError",this.message=e.message,super.update()}static is(e){return e.name==="RenderError"}},$e=class extends V{constructor(e){super(e[0],e[0].token),this.errors=e,this.name="LiquidErrors";let n=e.length>1?"s":"";this.message=`${e.length} error${n} found`,super.update()}static is(e){return e.name==="LiquidErrors"}},kt=class extends V{constructor(e,n){super(e,n),this.name="UndefinedVariableError",this.message=e.message,super.update()}},xt=class extends Error{constructor(e){super(`undefined variable: ${e}`),this.name="InternalUndefinedVariableError",this.variableName=e}},St=class extends Error{constructor(e){super(e),this.name="AssertionError",this.message=e+""}};function ci(t){let[e,n]=t.getPosition(),s=t.input.split(`
`),i=Math.max(e-2,1),r=Math.min(e+3,s.length);return ps(i,r+1).map(o=>{let l=o===e?">> ":"   ",c=de(String(o),String(r).length),d=`${l}${c}| `,p=o===e?`
`+de("^",n+d.length):"";return d+=s[o-1],d+=p,d}).join(`
`)}function di(t,e){e.file&&(t+=`, file:${e.file}`);let[n,s]=e.getPosition();return t+=`, line:${n}, col:${s}`,t}var b=[0,0,0,0,0,0,0,0,0,20,4,4,4,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,2,8,0,0,0,0,8,0,0,0,64,0,65,0,0,33,33,33,33,33,33,33,33,33,33,0,0,2,2,2,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],ui=1,ue=4,Hn=8,gs=16,pi=32,hi=64,fi=128;function Ee(t){let e=t.charCodeAt(0);return e>=128?!b[e]:!!(b[e]&ui)}b[160]=b[5760]=b[6158]=b[8192]=b[8193]=b[8194]=b[8195]=b[8196]=b[8197]=b[8198]=b[8199]=b[8200]=b[8201]=b[8202]=b[8232]=b[8233]=b[8239]=b[8287]=b[12288]=ue;b[8220]=b[8221]=fi;function S(t,e){if(!t){let n=typeof e=="function"?e():e||`expect ${t} to be true`;throw new St(n)}}function Pe(t,e=`unexpected ${JSON.stringify(t)}`){S(!t,e)}var Tt=class extends j{*equals(e){return v(yield f(e))}gt(){return!1}geq(){return!1}lt(){return!1}leq(){return!1}valueOf(){return null}},be=class t extends j{*equals(e){return e instanceof t?!1:(e=yield f(e),g(e)||x(e)?e.length===0:et(e)?Object.keys(e).length===0:!1)}gt(){return!1}geq(){return!1}lt(){return!1}leq(){return!1}valueOf(){return""}static is(e){return e instanceof t}},qt=class t extends be{*equals(e){return e===!1||v(yield f(e))?!0:g(e)?/^\s*$/.test(e):yield super.equals(e)}static is(e){return e instanceof t}},_e=class extends j{constructor(e,n,s){super(),this.i=0,this.length=e,this.name=`${s}-${n}`}next(){this.i++}index0(){return this.i}index(){return this.i+1}first(){return this.i===0}last(){return this.i===this.length-1}rindex(){return this.length-this.i}rindex0(){return this.length-this.i-1}valueOf(){return JSON.stringify(this)}},Be=class{constructor(){this.buffer=""}write(e){this.buffer+=u(e)}},zt=class{constructor(){throw this.buffer="",this.stream=null,new Error("streaming not supported in browser")}},Ft=class{constructor(){this.buffer=""}write(e){e=f(e),typeof e!="string"&&this.buffer===""?this.buffer=e:this.buffer=u(this.buffer)+u(e)}},Ne=class extends j{constructor(e=()=>""){super(),this.superBlockRender=e}*super(){let e=new Be;return yield this.superBlockRender(e),e.buffer}};function C(t){return t&&k(t.equals)&&k(t.gt)&&k(t.geq)&&k(t.lt)&&k(t.leq)}var Jn=new Tt,ms={true:!0,false:!1,nil:Jn,null:Jn,empty:new be,blank:new qt},Wn=new WeakMap;function Yn(t){let e=Wn.get(t);if(e)return e;let n={};for(let[s,i]of Object.entries(t)){let r=n;for(let a=0;a<s.length;a++){let o=s[a];r[o]=r[o]||{},a===s.length-1&&Ee(s[a])&&(r[o].needBoundary=!0),r=r[o]}r.data=i,r.end=!0}return Wn.set(t,n),n}var Me=function(){return Me=Object.assign||function(e){for(var n,s=1,i=arguments.length;s<i;s++){n=arguments[s];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},Me.apply(this,arguments)};function w(t,e,n,s){function i(r){return r instanceof n?r:new n(function(a){a(r)})}return new(n||(n=Promise))(function(r,a){function o(d){try{c(s.next(d))}catch(p){a(p)}}function l(d){try{c(s.throw(d))}catch(p){a(p)}}function c(d){d.done?r(d.value):i(d.value).then(o,l)}c((s=s.apply(t,e||[])).next())})}function Ot(t,e){let n=e||t;return(s,...i)=>s?n(...i):t(...i)}function N(t){return w(this,void 0,void 0,function*(){if(!De(t))return t;let e,n=!1,s="next";do{let i=t[s](e);n=!!i.done,e=i.value,s="next";try{De(e)&&(e=N(e)),ei(e)&&(e=yield e)}catch(r){s="throw",e=r}}while(!n);return e})}function M(t){if(!De(t))return t;let e,n=!1,s="next";do{let i=t[s](e);if(n=!!i.done,e=i.value,s="next",De(e))try{e=M(e)}catch(r){s="throw",e=r}}while(!n);return e}var gi=/%([-_0^#:]+)?(\d+)?([EO])?(.)/;function mi(t){return[31,yi(t)?29:28,31,30,31,30,31,31,30,31,30,31]}function ys(t){let e=0;for(let n=0;n<t.getMonth();++n)e+=mi(t)[n];return e+t.getDate()}function Gn(t,e){let n=(t.getDay()-e+7)%7;return String(Math.floor((ys(t)-1-n+7)/7))}function yi(t){let e=t.getFullYear();return!!((e&3)===0&&(e%100||e%400===0&&e))}function bi(t){let e=t.getDate();if([11,12,13].includes(e))return"th";switch(e%10){case 1:return"st";case 2:return"nd";case 3:return"rd";default:return"th"}}function _i(t){return Math.floor(t.getFullYear()/100)}var wi={C:2,d:2,e:2,H:2,I:2,j:3,k:2,l:2,L:3,m:2,M:2,S:2,U:2,W:2,y:2},vi=new Set("aAbBceklpP");function Qn(t,e){let n=Math.abs(t.getTimezoneOffset()),s=Math.floor(n/60),i=n%60;return(t.getTimezoneOffset()>0?"-":"+")+de(s,2,"0")+(e.flags[":"]?":":"")+de(i,2,"0")}var jt={a:t=>t.getShortWeekdayName(),A:t=>t.getLongWeekdayName(),b:t=>t.getShortMonthName(),B:t=>t.getLongMonthName(),c:t=>t.toLocaleString(),C:t=>_i(t),d:t=>t.getDate(),e:t=>t.getDate(),H:t=>t.getHours(),I:t=>String(t.getHours()%12||12),j:t=>ys(t),k:t=>t.getHours(),l:t=>String(t.getHours()%12||12),L:t=>t.getMilliseconds(),m:t=>t.getMonth()+1,M:t=>t.getMinutes(),N:(t,e)=>{var n;let s=Number(e.width)||9,i=de(String(t.getMilliseconds()),3,"0").slice(0,s);return(n=e.memoryLimit)===null||n===void 0||n.use(s-i.length),ii(i,s,"0")},p:t=>t.getHours()<12?"AM":"PM",P:t=>t.getHours()<12?"am":"pm",q:t=>bi(t),s:t=>Math.floor(t.dateValue()/1e3),S:t=>t.getSeconds(),u:t=>t.getDay()||7,U:t=>Gn(t,0),w:t=>t.getDay(),W:t=>Gn(t,1),x:t=>t.toLocaleDateString(),X:t=>t.toLocaleTimeString(),y:t=>(t.getFullYear()%100+100)%100,Y:t=>t.getFullYear(),z:Qn,Z:(t,e)=>t.getTimeZoneName()||Qn(t,e),t:()=>"	",n:()=>`
`,"%":()=>"%"};jt.h=jt.b;function Re(t,e,n){let s="",i=e,r;for(;r=gi.exec(i);)s+=i.slice(0,r.index),i=i.slice(r.index+r[0].length),s+=ki(t,r,n);return s+i}function ki(t,e,n){let[s,i="",r,a,o]=e,l=jt[o];if(!l)return s;let c={};for(let m of i)c[m]=!0;let d=String(l(t,{flags:c,width:r,modifier:a,memoryLimit:n})),p=vi.has(o)?" ":"0",h=Number(r)||wi[o]||0;return c["^"]?d=d.toUpperCase():c["#"]&&(d=ri(d)),c._?p=" ":c[0]&&(p="0"),c["-"]&&(h=0),n?.use(Number(h)-d.length),de(d,h,p)}function bs(){return typeof Intl<"u"?Intl.DateTimeFormat:void 0}var xi=6e4,Si=/([zZ]|([+-])(\d{2}):?(\d{2}))$/,_s=["January","February","March","April","May","June","July","August","September","October","November","December"],Ti=_s.map(t=>t.slice(0,3)),ws=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],qi=ws.map(t=>t.slice(0,3)),W=class t{constructor(e,n,s){this.locale=n,this.DateTimeFormat=bs(),this.date=new Date(e),this.timezoneFixed=s!==void 0,s===void 0&&(s=this.date.getTimezoneOffset()),this.timezoneOffset=g(s)?t.getTimezoneOffset(s,this.date):s,this.timezoneName=g(s)?s:"";let i=(this.date.getTimezoneOffset()-this.timezoneOffset)*xi,r=this.date.getTime()+i;this.displayDate=new Date(r)}getTime(){return this.displayDate.getTime()}dateValue(){return this.date.getTime()}getMilliseconds(){return this.displayDate.getMilliseconds()}getSeconds(){return this.displayDate.getSeconds()}getMinutes(){return this.displayDate.getMinutes()}getHours(){return this.displayDate.getHours()}getDay(){return this.displayDate.getDay()}getDate(){return this.displayDate.getDate()}getMonth(){return this.displayDate.getMonth()}getFullYear(){return this.displayDate.getFullYear()}toLocaleString(e,n){return n?.timeZone?this.date.toLocaleString(e,n):this.displayDate.toLocaleString(e,n)}toLocaleTimeString(e){return this.displayDate.toLocaleTimeString(e)}toLocaleDateString(e){return this.displayDate.toLocaleDateString(e)}getTimezoneOffset(){return this.timezoneOffset}getTimeZoneName(){if(this.timezoneFixed)return this.timezoneName;if(this.DateTimeFormat)return this.DateTimeFormat().resolvedOptions().timeZone}getLongMonthName(){var e;return(e=this.format({month:"long"}))!==null&&e!==void 0?e:_s[this.getMonth()]}getShortMonthName(){var e;return(e=this.format({month:"short"}))!==null&&e!==void 0?e:Ti[this.getMonth()]}getLongWeekdayName(){var e;return(e=this.format({weekday:"long"}))!==null&&e!==void 0?e:ws[this.displayDate.getDay()]}getShortWeekdayName(){var e;return(e=this.format({weekday:"short"}))!==null&&e!==void 0?e:qi[this.displayDate.getDay()]}valid(){return!isNaN(this.getTime())}format(e){return this.DateTimeFormat&&this.DateTimeFormat(this.locale,e).format(this.displayDate)}static createDateFixedToTimezone(e,n){let s=e.match(Si);if(s&&s[1]==="Z")return new t(+new Date(e),n,0);if(s&&s[2]&&s[3]&&s[4]){let[,,i,r,a]=s,o=(i==="+"?-1:1)*(parseInt(r,10)*60+parseInt(a,10));return new t(+new Date(e),n,o)}return new t(e,n)}static getTimezoneOffset(e,n){let s=n.toLocaleString("en-US",{timeZone:e}),i=n.toLocaleString("en-US",{timeZone:"UTC"}),r=new Date(s);return(+new Date(i)-+r)/(60*1e3)}},we=class{constructor(e,n){this.base=0,this.message=`${e} limit exceeded`,this.limit=n}use(e){+e>0&&(S(this.base+ +e<=this.limit,this.message),this.base+=+e)}check(e){+e>0&&S(+e<=this.limit,this.message)}},ve=class extends O{constructor(e,[n,s],i,r,a,o,l,c){super(e,i,r,a,c),this.trimLeft=!1,this.trimRight=!1;let d=i[n]==="-",p=i[s-1]==="-",h=d?n+1:n,m=p?s-1:s;for(;h<m&&b[i.charCodeAt(h)]&ue;)h++;for(;m>h&&b[i.charCodeAt(m-1)]&ue;)m--;this.contentRange=[h,m],this.trimLeft=d||o,this.trimRight=p||l}get content(){return this.input.slice(this.contentRange[0],this.contentRange[1])}},Ie=class extends ve{constructor(e,n,s,i,r){let{trimTagLeft:a,trimTagRight:o,tagDelimiterLeft:l,tagDelimiterRight:c}=i,[d,p]=[n+l.length,s-c.length];super(_.Tag,[d,p],e,n,s,a,o,r),this.tokenizer=new L(e,i.operators,r,this.contentRange,i.groupedExpressions),this.name=this.tokenizer.readTagName(),this.tokenizer.assert(this.name,"illegal tag syntax, tag name expected"),this.tokenizer.skipBlank(),this.args=this.tokenizer.input.slice(this.tokenizer.p,this.contentRange[1])}},Lt=class extends ve{constructor(e,n,s,i,r){let{trimOutputLeft:a,trimOutputRight:o,outputDelimiterLeft:l,outputDelimiterRight:c}=i,d=[n+l.length,s-c.length];super(_.Output,d,e,n,s,a,o,r)}},Ve=class extends O{constructor(e,n,s,i){super(_.HTML,e,n,s,i),this.input=e,this.begin=n,this.end=s,this.file=i,this.trimLeft=0,this.trimRight=0}getContent(){return this.input.slice(this.begin+this.trimLeft,this.end-this.trimRight)}},At=class extends O{constructor(e,n,s,i){super(_.Number,e,n,s,i),this.input=e,this.begin=n,this.end=s,this.file=i,this.content=Number(this.getText())}},ge=class extends O{constructor(e,n,s,i){super(_.Word,e,n,s,i),this.input=e,this.begin=n,this.end=s,this.file=i,this.content=this.getText()}},Et=class extends O{constructor(e,n,s,i){super(_.Literal,e,n,s,i),this.input=e,this.begin=n,this.end=s,this.file=i,this.literal=this.getText(),this.content=ms[this.literal]}},Zn={"==":2,"!=":2,">":2,"<":2,">=":2,"<=":2,contains:2,not:1,and:0,or:0},zi={"==":0,"!=":0,">":0,"<":0,">=":0,"<=":0,contains:0,not:1,and:0,or:0},Rt=class extends O{constructor(e,n,s,i){super(_.Operator,e,n,s,i),this.input=e,this.begin=n,this.end=s,this.file=i,this.operator=this.getText()}getPrecedence(){return this.operator in Zn?Zn[this.operator]:1}},Ue=class extends O{constructor(e,n,s,i,r,a){super(_.PropertyAccess,s,i,r,a),this.variable=e,this.props=n}},He=class extends O{constructor(e,n,s,i,r,a){super(_.Filter,s,i,r,a),this.name=e,this.args=n}},Ct=class extends O{constructor(e,n,s,i,r,a){super(_.Hash,e,n,s,a),this.input=e,this.begin=n,this.end=s,this.name=i,this.value=r,this.file=a}},Fi=/[\da-fA-F]/,Xn=/[0-7]/,Kn={b:"\b",f:"\f",n:`
`,r:"\r",t:"	",v:"\v"};function es(t){let e=t.charCodeAt(0);return e>=97?e-87:e>=65?e-55:e-48}function Oi(t){let e="";for(let n=1;n<t.length-1;n++){if(t[n]!=="\\"){e+=t[n];continue}if(Kn[t[n+1]]!==void 0)e+=Kn[t[++n]];else if(t[n+1]==="u"){let s=0,i=n+2;for(;i<=n+5&&Fi.test(t[i]);)s=s*16+es(t[i++]);n=i-1,e+=String.fromCharCode(s)}else if(!Xn.test(t[n+1]))e+=t[++n];else{let s=n+1,i=0;for(;s<=n+3&&Xn.test(t[s]);)i=i*8+es(t[s++]);n=s-1,e+=String.fromCharCode(i)}}return e}var Dt=class extends O{constructor(e,n,s,i){super(_.Quoted,e,n,s,i),this.input=e,this.begin=n,this.end=s,this.file=i,this.content=Oi(this.getText())}},$t=class extends O{constructor(e,n,s,i,r,a){super(_.Range,e,n,s,a),this.input=e,this.begin=n,this.end=s,this.lhs=i,this.rhs=r,this.file=a}},Pt=class extends ve{constructor(e,n,s,i,r){super(_.Tag,[n,s],e,n,s,!1,!1,r),this.tokenizer=new L(e,i.operators,r,this.contentRange,i.groupedExpressions),this.name=this.tokenizer.readTagName(),this.tokenizer.assert(this.name,"illegal liquid tag syntax"),this.tokenizer.skipBlank()}get args(){return this.tokenizer.input.slice(this.tokenizer.p,this.contentRange[1])}},Je=class extends O{constructor(e,n,s,i,r,a){super(_.FilteredValue,s,i,r,a),this.initial=e,this.filters=n,this.input=s,this.begin=i,this.end=r,this.file=a}},ji={now:()=>Date.now()};function Bt(){return typeof global=="object"&&global.performance||typeof window=="object"&&window.performance||ji}var Nt=class{renderTemplatesToNodeStream(e,n){let s=new zt;return Promise.resolve().then(()=>N(this.renderTemplates(e,n,s))).then(()=>s.end(),i=>s.error(i)),s.stream}*renderTemplates(e,n,s){s||(s=n.opts.keepOutputType?new Ft:new Be),n.renderLimit.check(Bt().now());let i=[];for(let r of e){n.renderLimit.check(Bt().now());try{let a=yield r.render(n,s);if(a&&s.write(a),n.breakCalled||n.continueCalled)break}catch(a){let o=V.is(a)?a:new vt(a,r);if(n.opts.catchAllErrors)i.push(o);else throw o}}if(i.length)throw new $e(i);return s.buffer}};function _n(t){return x(t)}var ke=class{constructor(e,n,s){this.token=e,this.name=e.name,this.handler=k(n)?n:k(n?.handler)?n.handler:fs,this.raw=!k(n)&&!!n?.raw,this.args=e.args,this.liquid=s}*render(e,n){let s=[];for(let i of this.args)_n(i)?s.push([i[0],yield T(i[1],n)]):s.push(yield T(i,n));return yield this.handler.apply({context:n,token:this.token,liquid:this.liquid},[e,...s])}},We=class{constructor(e){this.postfix=[...Ci(e)]}*evaluate(e,n){S(e,"unable to evaluate: context not defined");let s=[];for(let i of this.postfix)if(qs(i)){let r=s.pop(),a;if(zi[i.operator]===1)a=yield e.opts.operators[i.operator](r,e);else{let o=s.pop();a=yield e.opts.operators[i.operator](o,r,e)}s.push(a)}else s.push(yield T(i,e,n));return s[0]}valid(){return!!this.postfix.length}};function*T(t,e,n=!1){if(t){if("content"in t)return t.content;if(Ze(t))return yield Ai(t,e,n);if(zs(t))return yield Ri(t,e);if(vn(t))return yield Li(t,e,n)}}function*Li(t,e,n){S(e.liquid,"FilteredValueToken evaluation requires liquid instance in context"),n=n||e.opts.lenientIf&&t.filters.length>0&&t.filters[0].name==="default";let s=yield t.initial.evaluate(e,n);for(let i of t.filters){let r=e.liquid.filters[i.name];S(r||!e.liquid.options.strictFilters,()=>`undefined filter: ${i.name}`),s=yield new ke(i,r,e.liquid).render(s,e)}return s}function*Mt(t,e,n=!1){return yield f(yield T(t,e,n))}function*Ai(t,e,n){let s=[];for(let i of t.props)s.push(yield Mt(i,e,!1));try{if(t.variable){let i=yield T(t.variable,e,n);return yield e._getFromScope(i,s)}else return yield e._get(s)}catch(i){if(n&&i.name==="InternalUndefinedVariableError")return null;throw new kt(i,t)}}function Ei(t){return t.content}function*Ri(t,e){let n=yield Mt(t.lhs,e),s=yield Mt(t.rhs,e);return e.memoryLimit.use(s-n+1),ps(+n,+s+1)}function*Ci(t){let e=[];for(let n of t)if(qs(n)){for(;e.length&&e[e.length-1].getPrecedence()>n.getPrecedence();)yield e.pop();e.push(n)}else yield n;for(;e.length;)yield e.pop()}function ee(t,e){return!nt(t,e)}function nt(t,e){return t=f(t),e.opts.jsTruthy?!t:t===!1||t===void 0||t===null}var Di={"==":function*(t,e){return yield Y(t,e)},"!=":function*(t,e){return!(yield Y(t,e))},">":function*(t,e){return C(t)?yield t.gt(e):C(e)?yield e.lt(t):(yield f(t))>(yield f(e))},"<":function*(t,e){return C(t)?yield t.lt(e):C(e)?yield e.gt(t):(yield f(t))<(yield f(e))},">=":function*(t,e){return C(t)?yield t.geq(e):C(e)?yield e.leq(t):(yield f(t))>=(yield f(e))},"<=":function*(t,e){return C(t)?yield t.leq(e):C(e)?yield e.geq(t):(yield f(t))<=(yield f(e))},contains:function*(t,e){return t=yield f(t),x(t)?yield vs(t,e):k(t?.indexOf)?t.indexOf(yield f(e))>-1:!1},not:function*(t,e){return nt(yield f(t),e)},and:function*(t,e,n){return ee(yield f(t),n)&&ee(yield f(e),n)},or:function*(t,e,n){return ee(yield f(t),n)||ee(yield f(e),n)}};function*Y(t,e){return C(t)?yield t.equals(e):C(e)?yield e.equals(t):(t=yield f(t),e=yield f(e),x(t)?x(e)&&(yield $i(t,e)):t===e)}function*$i(t,e){if(t.length!==e.length)return!1;for(let n=0;n<t.length;n++)if(!(yield Y(t[n],e[n])))return!1;return!0}function*vs(t,e){for(let n of t)if(yield Y(n,e))return!0;return!1}var me=class{constructor(e,n,s,i){this.key=e,this.value=n,this.next=s,this.prev=i}},Ye=class{constructor(e,n=0){this.limit=e,this.size=n,this.cache={},this.head=new me("HEAD",null,null,null),this.tail=new me("TAIL",null,null,null),this.head.next=this.tail,this.tail.prev=this.head}write(e,n){if(this.cache[e])this.cache[e].value=n;else{let s=new me(e,n,this.head.next,this.head);this.head.next.prev=s,this.head.next=s,this.cache[e]=s,this.size++,this.ensureLimit()}}read(e){if(!this.cache[e])return;let{value:n}=this.cache[e];return this.remove(e),this.write(e,n),n}remove(e){let n=this.cache[e];n.prev.next=n.next,n.next.prev=n.prev,delete this.cache[e],this.size--}clear(){this.head.next=this.tail,this.tail.prev=this.head,this.size=0,this.cache={}}ensureLimit(){this.size>this.limit&&this.remove(this.tail.prev.key)}};function ks(t,e){let n=document.createElement("base");n.href=t;let s=document.getElementsByTagName("head")[0];s.insertBefore(n,s.firstChild);let i=document.createElement("a");i.href=e;let r=i.href;return s.removeChild(n),r}function Pi(t,e,n){return t.length&&si(t)!=="/"&&(t+="/"),ks(t,e).replace(/^(\w+:\/\/[^/]+)(\/[^?]+)/,(i,r,a)=>{let o=a.split("/").pop();return/\.\w+$/.test(o)?i:r+a+n})}function Bi(t){return w(this,void 0,void 0,function*(){return new Promise((e,n)=>{let s=new XMLHttpRequest;s.onload=()=>{s.status>=200&&s.status<300?e(s.responseText):n(new Error(s.statusText))},s.onerror=()=>{n(new Error("An error occurred whilst receiving the response."))},s.open("GET",t),s.send()})})}function Ni(t){let e=new XMLHttpRequest;if(e.open("GET",t,!1),e.send(),e.status<200||e.status>=300)throw new Error(e.statusText);return e.responseText}function Mi(t){return w(this,void 0,void 0,function*(){return!0})}function Ii(t){return!0}function Vi(t){return ks(t,".")}var Ui="/",Hi=Object.freeze({__proto__:null,resolve:Pi,readFile:Bi,readFileSync:Ni,exists:Mi,existsSync:Ii,dirname:Vi,sep:Ui});function It(t,e){typeof e=="string"?t.use(e.length):e===null||typeof e=="number"||typeof e=="boolean"?t.use(JSON.stringify(e).length):Array.isArray(e)?t.use(e.length+1):typeof e=="object"&&t.use(2)}function Ji(t,e,...n){return t=f(t),x(t)||g(t)?t.length?t:e:t===!1&&new Map(n).get("allow_false")?!1:nt(t,this.context)?e:t}function ts(t,e=0){let n=this.context.memoryLimit;return JSON.stringify(t,(s,i)=>(It(n,i),i),e)}function Wi(t,e=0){let n=this.context.memoryLimit,s=[];return JSON.stringify(t,function(i,r){if(typeof r!="object"||r===null)return It(n,r),r;for(;s.length>0&&s[s.length-1]!==this;)s.pop();return s.includes(r)?(n.use(10),"[Circular]"):(s.push(r),It(n,r),r)},e)}function Yi(t){return Number(t)}var Gi={raw:!0,handler:fs},xs={default:Ji,raw:Gi,jsonify:ts,to_integer:Yi,json:ts,inspect:Wi},Qi={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},Zi={"&amp;":"&","&lt;":"<","&gt;":">","&#34;":'"',"&#39;":"'"};function st(t){return t=u(t),this.context.memoryLimit.use(t.length),t.replace(/&|<|>|"|'/g,e=>Qi[e])}function Xi(t){return st.call(this,t)}function Ki(t){return t=u(t),this.context.memoryLimit.use(t.length),t.replace(/&(amp|lt|gt|#34|#39);/g,e=>Zi[e])}function er(t){return st.call(this,Ki.call(this,t))}function tr(t){let e=u(t);return this.context.memoryLimit.use(e.length),e.replace(/\r?\n/gm,`<br />
`)}function nr(t){let e=u(t);this.context.memoryLimit.use(e.length);let n=new Map([["<script","<\/script>"],["<style","</style>"],["<!--","-->"],["<",">"]]),s="",i=0;for(;i<e.length;){let r=e.indexOf("<",i);if(r<0)return s+e.slice(i);s+=e.slice(i,r);for(let[a,o]of n){if(!e.startsWith(a,r))continue;let l=e.indexOf(o,r+a.length);if(l>=0){i=l+o.length;break}n.delete(a)}if(i<=r)return s+e.slice(r)}return s}var sr=Object.freeze({__proto__:null,escape:st,xml_escape:Xi,escape_once:er,newline_to_br:tr,strip_html:nr}),Vt=class{constructor(e){this.mapping=e,this.sep="/"}exists(e){return w(this,void 0,void 0,function*(){return this.existsSync(e)})}existsSync(e){return!v(this.mapping[e])}readFile(e){return w(this,void 0,void 0,function*(){return this.readFileSync(e)})}readFileSync(e){let n=this.mapping[e];if(v(n))throw new Error(`ENOENT: ${e}`);return n}dirname(e){let n=e.split(this.sep);return n.pop(),n.join(this.sep)}resolve(e,n,s){if(n+=s,e===".")return n;let i=e.split(/\/+/);for(let r of n.split(this.sep))r==="."||r===""||(r===".."?(i.length>1||i[0]!=="")&&i.pop():i.push(r));return i.join(this.sep)}},ce={root:["."],layouts:["."],partials:["."],relativeReference:!0,jekyllInclude:!1,keyValueSeparator:":",cache:void 0,extname:"",fs:Hi,dynamicPartials:!0,jsTruthy:!1,dateFormat:"%A, %B %-e, %Y at %-l:%M %P %z",locale:"",trimTagRight:!1,trimTagLeft:!1,trimOutputRight:!1,trimOutputLeft:!1,greedy:!0,tagDelimiterLeft:"{%",tagDelimiterRight:"%}",outputDelimiterLeft:"{{",outputDelimiterRight:"}}",preserveTimezones:!1,strictFilters:!1,strictVariables:!1,ownPropertyOnly:!0,lenientIf:!1,globals:{},keepOutputType:!1,operators:Di,groupedExpressions:!1,memoryLimit:1/0,parseLimit:1/0,renderLimit:1/0};function ir(t){var e,n;if(t.hasOwnProperty("root")&&(t.hasOwnProperty("partials")||(t.partials=t.root),t.hasOwnProperty("layouts")||(t.layouts=t.root)),t.hasOwnProperty("cache")){let s;typeof t.cache=="number"?s=t.cache>0?new Ye(t.cache):void 0:typeof t.cache=="object"?s=t.cache:s=t.cache?new Ye(1024):void 0,t.cache=s}return t=Object.assign(Object.assign(Object.assign({},ce),t.jekyllInclude?{dynamicPartials:!1}:{}),t),(!t.fs.dirname||!t.fs.sep)&&t.relativeReference&&(console.warn("[LiquidJS] `fs.dirname` and `fs.sep` are required for relativeReference, set relativeReference to `false` to suppress this warning"),t.relativeReference=!1),t.root=Ce(t.root),t.partials=Ce(t.partials),t.layouts=Ce(t.layouts),t.outputEscape=t.outputEscape&&rr(t.outputEscape),t.locale||(t.locale=(n=(e=bs())===null||e===void 0?void 0:e().resolvedOptions().locale)!==null&&n!==void 0?n:"en-US"),t.templates&&(t.fs=new Vt(t.templates),t.relativeReference=!0,t.root=t.partials=t.layouts="."),t}function rr(t){return t==="escape"?st:t==="json"?xs.json:(S(k(t),"`outputEscape` need to be of type string or function"),t)}function Ce(t){let e=[];return x(t)&&(e=t),g(t)&&(e=[t]),e}function ar(t,e){let n=!1;for(let s=0;s<t.length;s++){let i=t[s];pr(i)&&(!n&&i.trimLeft&&or(t[s-1],e.greedy),se(i)&&(i.name==="raw"?n=!0:i.name==="endraw"&&(n=!1)),!n&&i.trimRight&&lr(t[s+1],e.greedy))}}function or(t,e){if(!t||!wn(t))return;let n=e?ue:gs;for(;b[t.input.charCodeAt(t.end-1-t.trimRight)]&n;)t.trimRight++}function lr(t,e){if(!t||!wn(t))return;let n=e?ue:gs;for(;b[t.input.charCodeAt(t.begin+t.trimLeft)]&n;)t.trimLeft++;t.input.charAt(t.begin+t.trimLeft)===`
`&&t.trimLeft++}var L=class{constructor(e,n=ce.operators,s,i,r=!1){this.input=e,this.file=s,this.rawBeginAt=-1,this.p=i?i[0]:0,this.N=i?i[1]:e.length,this.opTrie=Yn(n),this.literalTrie=Yn(ms),this.groupedExpressions=r}readExpression(){return new We(this.readExpressionTokens())}*readExpressionTokens(){for(;this.p<this.N;){let e=this.readOperator();if(e){yield e;continue}let n=this.readValue();if(n){yield n;continue}return}}readOperator(){this.skipBlank();let e=this.matchTrie(this.opTrie);if(e!==-1)return new Rt(this.input,this.p,this.p=e,this.file)}matchTrie(e){let n=e,s=this.p,i;for(;n[this.input[s]]&&s<this.N;)n=n[this.input[s++]],n.end&&(i=n);return!i||i.needBoundary&&Ee(this.peek(s-this.p))?-1:s}readFilteredValue(){let e=this.p,n=this.readExpression();this.assert(n.valid(),`invalid value expression: ${this.snapshot()}`);let s=this.readFilters();return new Je(n,s,this.input,e,this.p,this.file)}readFilters(){let e=[];for(;;){let n=this.readFilter();if(!n)return e;e.push(n)}}readFilter(){if(this.skipBlank(),this.end()||this.peek()===")")return null;this.assert(this.read()==="|",'expected "|" before filter');let e=this.readIdentifier();if(!e.size())return this.assert(this.end(),"expected filter name"),null;let n=[];if(this.skipBlank(),this.peek()===":")do{++this.p;let s=this.readFilterArg();s&&n.push(s),this.skipBlank(),this.assert(this.end()||this.peek()===","||this.peek()==="|"||this.peek()===")",()=>`unexpected character ${this.snapshot()}`)}while(this.peek()===",");else if(!(this.peek()==="|"||this.peek()===")"||this.end()))throw this.error('expected ":" after filter name');return new He(e.getText(),n,this.input,e.begin,this.p,this.file)}readFilterArg(){let e=this.readValue();if(!e)return;if(this.skipBlank(),this.peek()!==":")return e;++this.p;let n=this.readValue();return[e.getText(),n]}readTopLevelTokens(e=ce){let n=[];for(;this.p<this.N;){let s=this.readTopLevelToken(e);n.push(s)}return ar(n,e),n}readTopLevelToken(e){let{tagDelimiterLeft:n,outputDelimiterLeft:s}=e;return this.rawBeginAt>-1?this.readEndrawOrRawContent(e):this.match(n)?this.readTagToken(e):this.match(s)?this.readOutputToken(e):this.readHTMLToken([n,s])}readHTMLToken(e){let n=this.p;for(;this.p<this.N&&!e.some(s=>this.match(s));)++this.p;return new Ve(this.input,n,this.p,this.file)}readTagToken(e){let{file:n,input:s}=this,i=this.p;if(this.readToDelimiter(e.tagDelimiterRight)===-1)throw this.error(`tag ${this.snapshot(i)} not closed`,i);let r=new Ie(s,i,this.p,e,n);return r.name==="raw"&&(this.rawBeginAt=i),r}readToDelimiter(e,n=!1){for(this.skipBlank();this.p<this.N;){if(n&&this.peekType()&Hn){this.readQuoted();continue}if(++this.p,this.rmatch(e))return this.p}return-1}readOutputToken(e=ce){let{file:n,input:s}=this,{outputDelimiterRight:i}=e,r=this.p;if(this.readToDelimiter(i,!0)===-1)throw this.error(`output ${this.snapshot(r)} not closed`,r);return new Lt(s,r,this.p,e,n)}readEndrawOrRawContent(e){let{tagDelimiterLeft:n,tagDelimiterRight:s}=e,i=this.p,r=this.readTo(n)-n.length;for(;this.p<this.N;){if(this.readIdentifier().getText()!=="endraw"){r=this.readTo(n)-n.length;continue}for(;this.p<=this.N;){if(this.rmatch(s)){let a=this.p;return i===r?(this.rawBeginAt=-1,new Ie(this.input,i,a,e,this.file)):(this.p=r,new Ve(this.input,i,r,this.file))}if(this.rmatch(n))break;this.p++}}throw this.error(`raw ${this.snapshot(this.rawBeginAt)} not closed`,i)}readLiquidTagTokens(e=ce){let n=[];for(;this.p<this.N;){let s=this.readLiquidTagToken(e);s&&n.push(s)}return n}readLiquidTagToken(e){if(this.skipBlank(),this.end())return;let n=this.p;this.readToDelimiter(`
`);let s=this.p;return new Pt(this.input,n,s,e,this.file)}error(e,n=this.p){return new _t(e,new ge(this.input,n,this.N,this.file))}assert(e,n,s){if(!e)throw this.error(typeof n=="function"?n():n,s)}snapshot(e=this.p){return JSON.stringify(ai(this.input.slice(e,this.N),32))}readWord(){return this.readIdentifier()}readIdentifier(){this.skipBlank();let e=this.p;for(;!this.end()&&Ee(this.peek());)++this.p;return new ge(this.input,e,this.p,this.file)}readNonEmptyIdentifier(){let e=this.readIdentifier();return e.size()?e:void 0}readTagName(){return this.skipBlank(),this.input[this.p]==="#"?this.input.slice(this.p,++this.p):this.readIdentifier().getText()}readHashes(e){let n=[];for(;;){let s=this.readHash(e);if(!s)return n;n.push(s)}}readHash(e){this.skipBlank(),this.peek()===","&&++this.p;let n=this.p,s=this.readNonEmptyIdentifier();if(!s)return;let i;this.skipBlank();let r=g(e)?e:e?"=":":";return this.peek()===r&&(++this.p,i=this.readValue()),new Ct(this.input,n,this.p,s,i,this.file)}remaining(){return this.input.slice(this.p,this.N)}advance(e=1){this.p+=e}end(){return this.p>=this.N}read(){return this.input[this.p++]}readTo(e){for(;this.p<this.N;)if(++this.p,this.rmatch(e))return this.p;return-1}readValue(){this.skipBlank();let e=this.p,n=this.readLiteral()||this.readQuoted()||this.readNumber();!n&&this.peek()==="("&&(n=this.readGroupOrRange());let s=this.readProperties(!n);return s.length?new Ue(n,s,this.input,e,this.p):n}readScopeValue(){this.skipBlank();let e=this.p,n=this.readProperties();if(n.length)return new Ue(void 0,n,this.input,e,this.p)}readProperties(e=!0){let n=[];for(;;){if(this.peek()==="["){this.p++;let s=this.readValue()||new ge(this.input,this.p,this.p,this.file);this.assert(this.readTo("]")!==-1,"[ not closed"),n.push(s);continue}if(e&&!n.length){let s=this.readNonEmptyIdentifier();if(s){n.push(s);continue}}if(this.peek()==="."&&this.peek(1)!=="."){this.p++;let s=this.readNonEmptyIdentifier();if(!s)break;n.push(s);continue}break}return n}readNumber(){this.skipBlank();let e=!1,n=!1,s=0;for(this.peekType()&hi&&s++;this.p+s<=this.N;)if(this.peekType(s)&pi)n=!0,s++;else if(this.peek(s)==="."&&this.peek(s+1)!=="."){if(e||!n)return;e=!0,s++}else break;if(n&&!Ee(this.peek(s))){let i=new At(this.input,this.p,this.p+s,this.file);return this.advance(s),i}}readLiteral(){this.skipBlank();let e=this.matchTrie(this.literalTrie);if(e===-1)return;let n=new Et(this.input,this.p,e,this.file);return this.p=e,n}readGroupOrRange(){this.skipBlank();let e=this.p;if(this.peek()!=="(")return;++this.p;let n=this.readValueOrThrow();if(this.skipBlank(),this.peek()==="."&&this.peek(1)==="."){this.p+=2;let s=this.readValueOrThrow();return this.skipBlank(),this.assert(this.read()===")","invalid range syntax"),new $t(this.input,e,this.p,n,s,this.file)}if(this.groupedExpressions){let s=new We([n,...this.readExpressionTokens()]);this.assert(s.valid(),()=>`invalid value expression: ${this.snapshot()}`);let i=this.readFilters();return this.skipBlank(),this.assert(this.read()===")","unbalanced parentheses"),new Je(s,i,this.input,e,this.p,this.file)}throw this.error("invalid range syntax")}readValueOrThrow(){let e=this.readValue();return this.assert(e,()=>`unexpected token ${this.snapshot()}, value expected`),e}readQuoted(){this.skipBlank();let e=this.p;if(!(this.peekType()&Hn))return;++this.p;let n=!1;for(;this.p<this.N&&(++this.p,!(this.input[this.p-1]===this.input[e]&&!n));)n?n=!1:this.input[this.p-1]==="\\"&&(n=!0);return new Dt(this.input,e,this.p,this.file)}*readFileNameTemplate(e){let{outputDelimiterLeft:n}=e,s=[","," ","\r",`
`,"	",n],i=new Set(s);for(;this.p<this.N&&!i.has(this.peek());)yield this.match(n)?this.readOutputToken(e):this.readHTMLToken(s)}match(e){for(let n=0;n<e.length;n++)if(e[n]!==this.input[this.p+n])return!1;return!0}rmatch(e){for(let n=0;n<e.length;n++)if(e[e.length-1-n]!==this.input[this.p-1-n])return!1;return!0}peekType(e=0){return this.p+e>=this.N?0:b[this.input.charCodeAt(this.p+e)]}peek(e=0){return this.p+e>=this.N?"":this.input[this.p+e]}skipBlank(){for(;this.peekType()&ue;)++this.p}},Ut=class{constructor(e,n){this.handlers={},this.stopRequested=!1,this.tokens=e,this.parseToken=n}on(e,n){return this.handlers[e]=n,this}trigger(e,n){let s=this.handlers[e];return s?(s.call(this,n),!0):!1}start(){this.trigger("start");let e;for(;!this.stopRequested&&(e=this.tokens.shift());){if(this.trigger("token",e)||se(e)&&this.trigger(`tag:${e.name}`,e))continue;let n=this.parseToken(e,this.tokens);this.trigger("template",n)}return this.stopRequested||this.trigger("end"),this}stop(){return this.stopRequested=!0,this}},xe=class{constructor(e){this.token=e}},y=class extends xe{constructor(e,n,s){super(e),this.name=e.name,this.liquid=s,this.tokenizer=e.tokenizer}},E=class{constructor(e,n){this.hash={};let s=e instanceof L?e:new L(e,{});for(let i of s.readHashes(n))this.hash[i.name.content]=i.value}*render(e){let n={};for(let s of Object.keys(this.hash))n[s]=this.hash[s]===void 0?!0:yield T(this.hash[s],e);return n}};function cr(t){return class extends y{constructor(e,n,s){super(e,n,s),k(t.parse)&&t.parse.call(this,e,n)}*render(e,n){let s=yield new E(this.token.args,e.opts.keyValueSeparator).render(e);return yield t.render.call(this,e,n,s)}}}var F=class{constructor(e,n){this.filters=[];let s=typeof e=="string"?new L(e,n.options.operators,void 0,void 0,n.options.groupedExpressions).readFilteredValue():e;this.initial=s.initial,this.filters=s.filters.map(i=>new ke(i,this.getFilter(n,i.name),n))}*value(e,n){n=n||e.opts.lenientIf&&this.filters.length>0&&this.filters[0].name==="default";let s=yield this.initial.evaluate(e,n);for(let i of this.filters)s=yield i.render(s,e);return s}getFilter(e,n){let s=e.filters[n];return S(s||!e.options.strictFilters,()=>`undefined filter: ${n}`),s}},Ht=class extends xe{constructor(e,n){var s;super(e);let i=new L(e.input,n.options.operators,e.file,e.contentRange,n.options.groupedExpressions);this.value=new F(i.readFilteredValue(),n);let r=this.value.filters,a=n.options.outputEscape;if(!(!((s=r[r.length-1])===null||s===void 0)&&s.raw)&&a){let o=new He(toString.call(a),[],"",0,0);r.push(new ke(o,a,n))}}*render(e,n){let s=yield f(yield this.value.value(e,!1));n.write(s)}*arguments(){yield this.value}},Jt=class extends xe{constructor(e){super(e),this.str=e.getContent()}*render(e,n){n.write(this.str)}},ne=class t{constructor(e,n){this.segments=e,this.location=n}toString(){return Qe(this.segments,!0)}toArray(){function*e(...n){for(let s of n)s instanceof t?yield Array.from(e(...s.segments)):yield s}return Array.from(e(...this.segments))}},ye=class{constructor(){this.map=new Map}get(e){let n=Qe([e.segments[0]]);return this.map.has(n)||this.map.set(n,[]),this.map.get(n)}has(e){return this.map.has(Qe([e.segments[0]]))}push(e){this.get(e).push(e)}asObject(){return Object.fromEntries(this.map)}},Ss={partials:!0};function*Ts(t,e,n){let s=new ye,i=new ye,r=new ye,a=new Ge(new Set),o=new Set;function l(d,p){s.push(d);let h=p.alias(d);if(h!==void 0){let m=h.segments[0];g(m)&&!a.has(m)&&i.push(h)}else{let m=d.segments[0];g(m)&&!p.has(m)&&i.push(d)}for(let m of d.segments)m instanceof ne&&l(m,p)}function*c(d,p){if(d.arguments)for(let h of d.arguments())for(let m of ns(h))l(m,p);if(d.localScope)for(let h of d.localScope()){p.add(h.content),p.deleteAlias(h.content);let[m,P]=h.getPosition();r.push(new ne([h.content],{row:m,col:P,file:h.file}))}if(d.children)if(d.partialScope){let h=d.partialScope();if(h===void 0){for(let Z of yield d.children(e,n))yield c(Z,p);return}if(o.has(h.name))return;let m=new Set,P=h.isolated?new Ge(m):p.push(m);for(let Z of h.scope)if(g(Z))m.add(Z);else{let[$n,Zs]=Z;m.add($n);let Pn=Array.from(ns(Zs));Pn.length&&P.setAlias($n,Pn[0].segments)}for(let Z of yield d.children(e,n))yield c(Z,P),o.add(h.name);P.pop()}else{d.blockScope&&p.push(new Set(d.blockScope()));for(let h of yield d.children(e,n))yield c(h,p);d.blockScope&&p.pop()}}for(let d of t)yield c(d,a);return{variables:s.asObject(),globals:i.asObject(),locals:r.asObject()}}function H(t,e={}){let n=Object.assign(Object.assign({},Ss),e);return N(Ts(t,n.partials,!1))}function J(t,e={}){let n=Object.assign(Object.assign({},Ss),e);return M(Ts(t,n.partials,!0))}var Ge=class{constructor(e){this.stack=[{names:e,aliases:new Map}]}has(e){for(let n of this.stack)if(n.names.has(e))return!0;return!1}push(e){return this.stack.push({names:e,aliases:new Map}),this}pop(){var e;return(e=this.stack.pop())===null||e===void 0?void 0:e.names}add(e){this.stack[0].names.add(e)}alias(e){let n=e.segments[0];if(!g(n))return;let s=this.getAlias(n);if(s!==void 0)return new ne([...s,...e.segments.slice(1)],e.location)}setAlias(e,n){this.stack[this.stack.length-1].aliases.set(e,n)}deleteAlias(e){this.stack[this.stack.length-1].aliases.delete(e)}getAlias(e){for(let n of this.stack){if(n.aliases.has(e))return n.aliases.get(e);if(n.names.has(e))return}}};function*ns(t){z(t)?yield*I(t):t instanceof F&&(yield*dr(t))}function*dr(t){for(let e of t.initial.postfix)z(e)&&(yield*I(e));for(let e of t.filters)for(let n of e.args)_n(n)&&n[1]?yield*I(n[1]):z(n)&&(yield*I(n))}function*I(t){zs(t)?(yield*I(t.lhs),yield*I(t.rhs)):vn(t)?yield*ur(t):Ze(t)&&(yield Wt(t))}function*ur(t){if(vn(t)){for(let e of t.initial.postfix)z(e)&&(yield*I(e));for(let e of t.filters)for(let n of e.args)_n(n)&&n[1]?yield*I(n[1]):z(n)&&(yield*I(n))}}function Wt(t){let e=[],n=t.file,s=t.props[0];n=n||s.file,Gt(s)||is(s)||rs(s)?e.push(s.content):Ze(s)&&e.push(...Wt(s).segments);for(let a of t.props.slice(1))n=n||a.file,Gt(a)||is(a)||rs(a)?e.push(a.content):Ze(a)&&e.push(Wt(a));let[i,r]=t.getPosition();return new ne(e,{row:i,col:r,file:n})}var ss=/^[\u0080-\uFFFFa-zA-Z_][\u0080-\uFFFFa-zA-Z0-9_-]*$/;function Qe(t,e=!1){let n=[],s=t[0];g(s)&&(!e||s.match(ss)?n.push(`${s}`):n.push(`['${s}']`));for(let i of t.slice(1))i instanceof ne?n.push(`[${Qe(i.segments)}]`):g(i)?i.match(ss)?n.push(`.${i}`):n.push(`['${i}']`):n.push(`[${i}]`);return n.join("")}var pe;(function(t){t.Partials="partials",t.Layouts="layouts",t.Root="root"})(pe||(pe={}));var Yt=class{constructor(e){var n,s,i,r;if(this.options=e,e.relativeReference){let o=e.fs.sep;S(o,"`fs.sep` is required for relative reference");let l=["."+o,".."+o,"./","../"];this.shouldLoadRelative=c=>l.some(d=>c.startsWith(d))}else this.shouldLoadRelative=o=>!1;let a=e.fs;this.contains=Ot(((n=a.contains)===null||n===void 0?void 0:n.bind(a))||(()=>w(this,void 0,void 0,function*(){return!0})),((s=a.containsSync)===null||s===void 0?void 0:s.bind(a))||(()=>!0)),this.exists=Ot(((i=a.exists)===null||i===void 0?void 0:i.bind(a))||(()=>w(this,void 0,void 0,function*(){return!1})),(r=a.existsSync)===null||r===void 0?void 0:r.bind(a))}*lookup(e,n,s,i){let r=this.options[n];for(let a of this.candidates(e,r,i)){let o=!1;for(let l of r)if(yield this.contains(!!s,l,a)){o=!0;break}if(o&&(yield this.exists(!!s,a)))return a}throw this.lookupError(e,r)}*candidates(e,n,s){let{fs:i,extname:r}=this.options;this.shouldLoadRelative(e)&&s&&(yield i.resolve(this.dirname(s),e,r));for(let a of n)yield i.resolve(a,e,r);if(i.fallback!==void 0){let a=i.fallback(e);a!==void 0&&(yield a)}}dirname(e){let n=this.options.fs;return S(n.dirname,"`fs.dirname` is required for relative reference"),n.dirname(e)}lookupError(e,n){let s=new Error("ENOENT");return s.message=`ENOENT: Failed to lookup "${e}" in "${n}"`,s.code="ENOENT",s}},B=class{constructor(e){var n,s;this.liquid=e,this.cache=this.liquid.options.cache,this.fs=this.liquid.options.fs,this.parseFile=this.cache?this._parseFileCached:this._parseFile,this.loader=new Yt(this.liquid.options),this.parseLimit=new we("parse length",e.options.parseLimit),this.readFile=Ot(((n=this.fs.readFile)===null||n===void 0?void 0:n.bind(this.fs))||(()=>w(this,void 0,void 0,function*(){throw new Error("readFile not implemented")})),(s=this.fs.readFileSync)===null||s===void 0?void 0:s.bind(this.fs))}parse(e,n){e=String(e),this.parseLimit.use(e.length);let i=new L(e,this.liquid.options.operators,n,void 0,this.liquid.options.groupedExpressions).readTopLevelTokens(this.liquid.options);return this.parseTokens(i)}parseTokens(e){let n,s=[],i=[];for(;n=e.shift();)try{s.push(this.parseToken(n,e))}catch(r){if(this.liquid.options.catchAllErrors)i.push(r);else throw r}if(i.length)throw new $e(i);return s}parseToken(e,n){try{if(se(e)){let s=this.liquid.tags[e.name];return S(s,`tag "${e.name}" not found`),new s(e,n,this.liquid,this)}return hr(e)?new Ht(e,this.liquid):new Jt(e)}catch(s){throw V.is(s)?s:new wt(s,e)}}parseStream(e){return new Ut(e,(n,s)=>this.parseToken(n,s))}*_parseFileCached(e,n,s=pe.Root,i){let r=this.cache,a=this.loader.shouldLoadRelative(e)?i+","+e:s+":"+e,o=yield r.read(a);if(o)return o;let l=this._parseFile(e,n,s,i),c=n?yield l:N(l);r.write(a,c);try{return yield c}catch(d){throw r.remove(a),d}}*_parseFile(e,n,s=pe.Root,i){let r=yield this.loader.lookup(e,s,n,i);return this.parse(yield this.readFile(!!n,r),r)}},_;(function(t){t[t.Number=1]="Number",t[t.Literal=2]="Literal",t[t.Tag=4]="Tag",t[t.Output=8]="Output",t[t.HTML=16]="HTML",t[t.Filter=32]="Filter",t[t.Hash=64]="Hash",t[t.PropertyAccess=128]="PropertyAccess",t[t.Word=256]="Word",t[t.Range=512]="Range",t[t.Quoted=1024]="Quoted",t[t.Operator=2048]="Operator",t[t.FilteredValue=4096]="FilteredValue",t[t.GroupedExpression=8192]="GroupedExpression",t[t.Delimited=12]="Delimited"})(_||(_={}));function pr(t){return!!(A(t)&_.Delimited)}function qs(t){return A(t)===_.Operator}function wn(t){return A(t)===_.HTML}function hr(t){return A(t)===_.Output}function se(t){return A(t)===_.Tag}function Gt(t){return A(t)===_.Quoted}function is(t){return A(t)===_.Number}function Ze(t){return A(t)===_.PropertyAccess}function rs(t){return A(t)===_.Word}function zs(t){return A(t)===_.Range}function vn(t){return A(t)===_.FilteredValue}function z(t){return(A(t)&5763)>0}function A(t){return t?t.kind:-1}function G(t){let e=Object.create(null);return t&&Object.assign(e,t),e}var K=class t{constructor(e={},n=ce,s={},{memoryLimit:i,renderLimit:r,liquid:a}={}){var o,l,c,d,p;this.scopes=[G()],this.registers={},this.breakCalled=!1,this.continueCalled=!1,this.sync=!!s.sync,this.opts=n,this.globals=(o=s.globals)!==null&&o!==void 0?o:n.globals,this.environments=et(e)?e:Object(e),this.strictVariables=(l=s.strictVariables)!==null&&l!==void 0?l:this.opts.strictVariables,this.ownPropertyOnly=(c=s.ownPropertyOnly)!==null&&c!==void 0?c:n.ownPropertyOnly,this.memoryLimit=i??new we("memory alloc",(d=s.memoryLimit)!==null&&d!==void 0?d:n.memoryLimit),this.renderLimit=r??new we("template render",Bt().now()+((p=s.renderLimit)!==null&&p!==void 0?p:n.renderLimit)),this.liquid=a}getRegister(e,n=void 0){return this.registers[e]=this.registers[e]||n}setRegister(e,n){return this.registers[e]=n}saveRegister(...e){return e.map(n=>[n,this.getRegister(n)])}restoreRegister(e){return e.forEach(([n,s])=>this.setRegister(n,s))}getAll(){return[this.globals,this.environments,...this.scopes].reduce((e,n)=>Me(e,n),{})}get(e){return this.getSync(e)}getSync(e){return M(this._get(e))}*_get(e){let n=this.findScope(e[0]);return yield this._getFromScope(n,e)}getFromScope(e,n){return M(this._getFromScope(e,n))}*_getFromScope(e,n,s=this.strictVariables){g(n)&&(n=n.split("."));for(let i=0;i<n.length;i++)if(e=yield this.readProperty(e,n[i]),s&&ti(e))throw new xt(n.slice(0,i+1).join("."));return e}push(e){return this.scopes.push(e)}pop(){return this.scopes.pop()}bottom(){return this.scopes[0]}spawn(e={}){return new t(e,this.opts,{sync:this.sync,globals:this.globals,strictVariables:this.strictVariables,ownPropertyOnly:this.ownPropertyOnly},{renderLimit:this.renderLimit,memoryLimit:this.memoryLimit,liquid:this.liquid})}findScope(e){for(let n=this.scopes.length-1;n>=0;n--){let s=this.scopes[n];if(e in s)return s}return e in this.environments?this.environments:this.globals}readProperty(e,n){if(e=ds(e),n=f(n),v(e))return e;if(x(e)&&qe(n))return Se(e,n,this.ownPropertyOnly);let s=kn(e,n,this.ownPropertyOnly);return s===void 0&&e instanceof j?e.liquidMethodMissing(n,this):k(s)?s.call(e):n==="size"?mr(e):n==="first"?fr(e,this.ownPropertyOnly):n==="last"?gr(e,this.ownPropertyOnly):s}};function kn(t,e,n){if(!(n&&!Ke.call(t,e)&&!(t instanceof j)))return t[e]}function fr(t,e){return x(t)?Se(t,0,e):kn(t,"first",e)}function gr(t,e){return x(t)?Se(t,-1,e):kn(t,"last",e)}function mr(t){if(Ke.call(t,"size")||t.size!==void 0)return t.size;if(x(t)||g(t))return t.length;if(typeof t=="object")return Object.keys(t).length}var te;(function(t){t[t.OUTPUT=0]="OUTPUT",t[t.STORE=1]="STORE"})(te||(te={}));var yr=D(Math.abs),br=D(Math.max),_r=D(Math.min),wr=D(Math.ceil),vr=D((t,e,n=!1)=>n?Math.floor(t/e):t/e),kr=D(Math.floor),xr=D((t,e)=>t-e),Sr=D((t,e)=>t+e),Tr=D((t,e)=>(t%e+e)%e),qr=D((t,e)=>t*e);function zr(t,e=0){t=bt(t),e=bt(e);let n=Math.pow(10,e),s=t*n*(1+Number.EPSILON);return Math.round(s)/n}var Fr=Object.freeze({__proto__:null,abs:yr,at_least:br,at_most:_r,ceil:wr,divided_by:vr,floor:kr,minus:xr,plus:Sr,modulo:Tr,times:qr,round:zr}),Or=t=>decodeURIComponent(u(t).replace(/\+/g," ")),jr=t=>encodeURIComponent(u(t)).replace(/%20/g,"+"),Lr=t=>encodeURIComponent(u(t)).replace(/%20/g,"+").replace(/[!'()*]/g,e=>"%"+e.charCodeAt(0).toString(16).toUpperCase()),Ar=t=>encodeURI(u(t)).replace(/%5B/g,"[").replace(/%5D/g,"]"),as=/[^\p{M}\p{L}\p{Nd}]+/ug,Er={raw:/\s+/g,default:as,pretty:/[^\p{M}\p{L}\p{Nd}._~!$&'()+,;=@]+/ug,ascii:/[^A-Za-z0-9]+/g,latin:as,none:null};function Rr(t,e="default",n=!1){t=u(t);let s=Er[e];return s&&(e==="latin"&&(t=Cr(t)),t=t.replace(s,"-").replace(/^-|-$/g,"")),n?t:t.toLowerCase()}function Cr(t){return t.replace(/[àáâãäå]/g,"a").replace(/[æ]/g,"ae").replace(/[ç]/g,"c").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[ð]/g,"d").replace(/[ñ]/g,"n").replace(/[òóôõöø]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ýÿ]/g,"y").replace(/[ß]/g,"ss").replace(/[œ]/g,"oe").replace(/[þ]/g,"th").replace(/[ẞ]/g,"SS").replace(/[Œ]/g,"OE").replace(/[Þ]/g,"TH")}var Dr=Object.freeze({__proto__:null,url_decode:Or,url_encode:jr,cgi_escape:Lr,uri_escape:Ar,slugify:Rr}),$r=tt(function(t,e){let n=q(t),s=v(e)?" ":u(e),i=s.length*Math.max(n.length-1,0);for(let r=0;r<n.length;r++)i+=String(n[r]).length;return this.context.memoryLimit.use(i),Array.prototype.join.call(n,s)}),Pr=tt(function(t){return us(t)?Se(t,-1,this.context.ownPropertyOnly):""}),Br=tt(function(t){return us(t)?Se(t,0,this.context.ownPropertyOnly):""}),Nr=tt(function(t){let e=q(t);return this.context.memoryLimit.use(e.length),[...e].reverse()});function*Fs(t,e,n){let s=[],i=q(t);this.context.memoryLimit.use(i.length);for(let r of i)s.push([r,e?yield this.context._getFromScope(r,u(e).split("."),!1):r]);return s.sort((r,a)=>n(r[1],a[1])).map(r=>r[0])}function*Mr(t,e){return yield*Fs.call(this,t,e,oi)}function*Ir(t,e){return yield*Fs.call(this,t,e,li)}var Vr=t=>t&&t.length||0;function*Ur(t,e){let n=[],s=q(t);this.context.memoryLimit.use(s.length);for(let i of s)n.push(yield this.context._getFromScope(i,u(e),!1));return n}function*Hr(t,e){let n=0,s=q(t);for(let i of s){let r=Number(e?yield this.context._getFromScope(i,u(e),!1):i);n+=Number.isNaN(r)?0:r}return n}function Jr(t){let e=q(t);return this.context.memoryLimit.use(e.length),Array.prototype.filter.call(e,n=>!v(f(n)))}function Os(t,e=[]){let n=q(t),s=q(e);return this.context.memoryLimit.use(n.length+s.length),Array.prototype.concat.call(n,s)}function Wr(t,e){return Os.call(this,t,[e])}function Yr(t,e){let n=q(t);this.context.memoryLimit.use(n.length);let s=[...n];return s.unshift(e),s}function Gr(t){let e=q(t);this.context.memoryLimit.use(e.length);let n=[...e];return n.pop(),n}function Qr(t){let e=q(t);this.context.memoryLimit.use(e.length);let n=[...e];return n.shift(),n}function Zr(t,e,n=1){return t=f(t),v(t)?[]:(x(t)||(t=u(t)),e=e<0?t.length+e:e,e<0||n<0?x(t)?[]:"":(this.context.memoryLimit.use(n),x(t)?Array.prototype.slice.call(t,e,e+n):String.prototype.slice.call(t,e,e+n)))}function*js(t,e){return this.context.opts.jekyllWhere?be.is(e)?yield Y(t,e):x(t)?yield vs(t,e):yield Y(t,e):e===void 0?ee(t,this.context):yield Y(t,e)}function*Ls(t,e,n,s){e=q(e),this.context.memoryLimit.use(e.length);let i=new L(u(n)).readScopeValue(),r=[];for(let a of e){let o=yield T(i,this.context.spawn(a));(yield js.call(this,o,s))===t&&r.push(a)}return r}function*As(t,e,n,s){let i=[],r=new F(u(s),this.liquid),a=q(e);this.context.memoryLimit.use(a.length);for(let o of a){this.context.push({[n]:o});let l=yield r.value(this.context);this.context.pop(),l===t&&i.push(o)}return i}function*Xr(t,e,n){return yield*Ls.call(this,!0,t,e,n)}function*Kr(t,e,n){return yield*Ls.call(this,!1,t,e,n)}function*ea(t,e,n){return yield*As.call(this,!0,t,e,n)}function*ta(t,e,n){return yield*As.call(this,!1,t,e,n)}function*na(t,e){let n=new Map;t=Te(t);let s=new L(u(e)).readScopeValue();this.context.memoryLimit.use(t.length);for(let i of t){let r=yield T(s,this.context.spawn(i));n.has(r)||n.set(r,[]),n.get(r).push(i)}return[...n.entries()].map(([i,r])=>({name:i,items:r}))}function*sa(t,e,n){let s=new Map,i=new F(u(n),this.liquid);t=Te(t),this.context.memoryLimit.use(t.length);for(let r of t){this.context.push({[e]:r});let a=yield i.value(this.context);this.context.pop(),s.has(a)||s.set(a,[]),s.get(a).push(r)}return[...s.entries()].map(([r,a])=>({name:r,items:a}))}function*xn(t,e,n){let s=new L(u(e)).readScopeValue(),i=q(t);for(let r=0;r<i.length;r++){let a=yield T(s,this.context.spawn(i[r]));if(yield js.call(this,a,n))return[r,i[r]]}}function*Sn(t,e,n){let s=new F(u(n),this.liquid),i=q(t);for(let r=0;r<i.length;r++){this.context.push({[e]:i[r]});let a=yield s.value(this.context);if(this.context.pop(),a)return[r,i[r]]}}function*ia(t,e,n){return!!(yield*xn.call(this,t,e,n))}function*ra(t,e,n){return!!(yield*Sn.call(this,t,e,n))}function*aa(t,e,n){let s=yield*xn.call(this,t,e,n);return s?s[0]:void 0}function*oa(t,e,n){let s=yield*Sn.call(this,t,e,n);return s?s[0]:void 0}function*la(t,e,n){let s=yield*xn.call(this,t,e,n);return s?s[1]:void 0}function*ca(t,e,n){let s=yield*Sn.call(this,t,e,n);return s?s[1]:void 0}function da(t){return t=q(t),this.context.memoryLimit.use(t.length),[...new Set(t)]}function ua(t,e=1){if(t=f(t),v(t))return[];x(t)||(t=u(t)),this.context.memoryLimit.use(t.length);let n=[...t].sort(()=>Math.random()-.5);return e===1?n[0]:n.slice(0,e)}var pa=Object.freeze({__proto__:null,join:$r,last:Pr,first:Br,reverse:Nr,sort:Mr,sort_natural:Ir,size:Vr,map:Ur,sum:Hr,compact:Jr,concat:Os,push:Wr,unshift:Yr,pop:Gr,shift:Qr,slice:Zr,where:Xr,reject:Kr,where_exp:ea,reject_exp:ta,group_by:na,group_by_exp:sa,has:ia,has_exp:ra,find_index:aa,find_index_exp:oa,find:la,find_exp:ca,uniq:da,sample:ua});function Tn(t,e,n){var s,i;let r=((s=t?.length)!==null&&s!==void 0?s:0)+((i=n?.length)!==null&&i!==void 0?i:0);this.context.memoryLimit.use(r);let a=Rs(t,this.context.opts,n);return a?(e=f(e),e=v(e)?this.context.opts.dateFormat:u(e),this.context.memoryLimit.use(e.length),Re(a,e,this.context.memoryLimit)):t}function ha(t){return Tn.call(this,t,"%Y-%m-%dT%H:%M:%S%:z")}function fa(t){return Tn.call(this,t,"%a, %d %b %Y %H:%M:%S %z")}function ga(t,e,n){return Es.call(this,t,"%b",e,n)}function ma(t,e,n){return Es.call(this,t,"%B",e,n)}function Es(t,e,n,s){let i=Rs(t,this.context.opts);if(!i)return t;let r=this.context.memoryLimit;if(n==="ordinal"){let a=i.getDate();return s==="US"?Re(i,`${e} ${a}%q, %Y`,r):Re(i,`${a}%q ${e} %Y`,r)}return Re(i,`%d ${e} %Y`,r)}function Rs(t,e,n){let s,i=n??e.timezoneOffset,r=e.locale;if(t=f(t),!v(t))return t==="now"||t==="today"?s=new W(Date.now(),r,i):qe(t)?s=new W(t*1e3,r,i):g(t)?/^\d+$/.test(t)?s=new W(+t*1e3,r,i):e.preserveTimezones&&n===void 0?s=W.createDateFixedToTimezone(t,r):s=new W(t,r,i):s=new W(t,r,i),s.valid()?s:void 0}var ya=Object.freeze({__proto__:null,date:Tn,date_to_xmlschema:ha,date_to_rfc822:fa,date_to_string:ga,date_to_long_string:ma}),yt=/[\u4E00-\u9FFF\uF900-\uFAFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/gu,os=/[^\u4E00-\u9FFF\uF900-\uFAFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\s]+/gu;function ba(t,e){S(arguments.length===2,"append expect 2 arguments");let n=u(t),s=u(e);return this.context.memoryLimit.use(n.length+s.length),n+s}function _a(t,e){S(arguments.length===2,"prepend expect 2 arguments");let n=u(t),s=u(e);return this.context.memoryLimit.use(n.length+s.length),s+n}function Cs(t,e){let n=0;for(let s of t){if(!e.has(s))break;n+=s.length}return n}function Ds(t,e,n=0){let s=t.length;for(;s>n;){let i=s-n>=2&&t.codePointAt(s-2)>65535?2:1;if(!e.has(t.slice(s-i,s)))break;s-=i}return s}function wa(t,e){let n=u(t);return this.context.memoryLimit.use(n.length),e?(e=u(e),this.context.memoryLimit.use(e.length),n.slice(Cs(n,new Set(e)))):n.trimStart()}function va(t){let e=u(t);return this.context.memoryLimit.use(e.length),e.toLowerCase()}function ka(t){let e=u(t);return this.context.memoryLimit.use(e.length),u(e).toUpperCase()}function xa(t,e){let n=u(t);return e=u(e),this.context.memoryLimit.use(n.length+e.length),n.split(e).join("")}function Sa(t,e){let n=u(t);return e=u(e),this.context.memoryLimit.use(n.length+e.length),n.replace(e,"")}function Ta(t,e){let n=u(t),s=u(e);this.context.memoryLimit.use(n.length+s.length);let i=n.lastIndexOf(s);return i===-1?n:n.substring(0,i)+n.substring(i+s.length)}function qa(t,e){return t=u(t),this.context.memoryLimit.use(t.length),e?(e=u(e),this.context.memoryLimit.use(e.length),t.slice(0,Ds(t,new Set(e)))):t.trimEnd()}function za(t,e){let n=u(t);this.context.memoryLimit.use(n.length);let s=n.split(u(e));for(;s.length&&s[s.length-1]==="";)s.pop();return s}function Fa(t,e){let n=u(t);if(this.context.memoryLimit.use(n.length),e){let s=new Set(u(e));this.context.memoryLimit.use(s.size);let i=Cs(n,s);return n.slice(i,Ds(n,s,i))}return n.trim()}function Oa(t){let e=u(t);return this.context.memoryLimit.use(e.length),e.replace(/\r?\n/gm,"")}function ja(t){let e=u(t);return this.context.memoryLimit.use(e.length),e.replace(/\s+/g," ").trim()}function La(t){return t=u(t),this.context.memoryLimit.use(t.length),t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()}function Aa(t,e,n){let s=u(t);e=u(e),n=u(n);let i=s.split(e),r=s.length+(i.length-1)*(n.length-e.length);return this.context.memoryLimit.use(r),i.join(n)}function Ea(t,e,n){let s=u(t);return e=u(e),n=u(n),this.context.memoryLimit.use(s.length+e.length+n.length),s.replace(e,()=>n)}function Ra(t,e,n){let s=u(t),i=u(e),r=u(n);this.context.memoryLimit.use(s.length+i.length+r.length);let a=s.lastIndexOf(i);return a===-1?s:s.substring(0,a)+r+s.substring(a+i.length)}function Ca(t,e=50,n="..."){let s=u(t);return n=u(n),this.context.memoryLimit.use(s.length+n.length),s.length<=e?t:s.substring(0,e-n.length)+n}function Da(t,e=15,n="..."){let s=u(t);n=u(n),this.context.memoryLimit.use(s.length+n.length);let i=s.trimStart().split(/\s+/);e<=0&&(e=1);let r=i.slice(0,e).join(" ");return i.length>=e&&(r+=n),r}function $a(t){let e=u(t);return this.context.memoryLimit.use(e.length),e.replace(/\s+/g," ")}function Pa(t,e){let n=u(t);if(this.context.memoryLimit.use(n.length),t=n.trim(),!t)return 0;switch(e){case"cjk":return(t.match(yt)||[]).length+(t.match(os)||[]).length;case"auto":return yt.test(t)?t.match(yt).length+(t.match(os)||[]).length:t.split(/\s+/).length;default:return t.split(/\s+/).length}}function Ba(t,e="and"){e=u(e);let n=e.length+t.length*2;for(let s=0;s<t.length;s++)n+=u(t[s]).length;switch(this.context.memoryLimit.use(n),t.length){case 0:return"";case 1:return t[0];case 2:return`${t[0]} ${e} ${t[1]}`;default:return`${t.slice(0,-1).join(", ")}, ${e} ${t[t.length-1]}`}}var Na=Object.freeze({__proto__:null,append:ba,prepend:_a,lstrip:wa,downcase:va,upcase:ka,remove:xa,remove_first:Sa,remove_last:Ta,rstrip:qa,split:za,strip:Fa,strip_newlines:Oa,squish:ja,capitalize:La,replace:Aa,replace_first:Ea,replace_last:Ra,truncate:Ca,truncatewords:Da,normalize_whitespace:$a,number_of_words:Pa,array_to_sentence_string:Ba});function Ma(t){let e=new TextEncoder().encode(t),n="";for(let s=0;s<e.length;s+=32768)n+=String.fromCharCode(...e.subarray(s,s+32768));return btoa(n)}function Ia(t){return new TextDecoder().decode(Uint8Array.from(atob(t),e=>e.charCodeAt(0)))}function Va(t){if(typeof Buffer<"u"&&Buffer.isBuffer(t))return this.context.memoryLimit.use(t.byteLength),t.toString("base64");let e=u(t);return this.context.memoryLimit.use(e.length),Ma(e)}function Ua(t){let e=u(t);return this.context.memoryLimit.use(e.length),Ia(e)}var Ha=Object.freeze({__proto__:null,base64_encode:Va,base64_decode:Ua});function $s(t){let e=new Uint8Array(t),n="";for(let s=0;s<e.length;s++)n+=e[s].toString(16).padStart(2,"0");return n}function Ja(t){return w(this,void 0,void 0,function*(){let e=new TextEncoder().encode(t),n=yield crypto.subtle.digest("SHA-256",e);return $s(n)})}function Wa(t,e){return w(this,void 0,void 0,function*(){let n=new TextEncoder,s=yield crypto.subtle.importKey("raw",n.encode(e),{name:"HMAC",hash:"SHA-256"},!1,["sign"]),i=yield crypto.subtle.sign("HMAC",s,n.encode(t));return $s(i)})}function Ya(t){let e=u(t);return this.context.memoryLimit.use(e.length),Ja(e)}function Ga(t,e){let n=u(t),s=u(e);return this.context.memoryLimit.use(n.length+s.length),Wa(n,s)}var Qa=Object.freeze({__proto__:null,sha256:Ya,hmac_sha256:Ga}),Za=Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},sr),Fr),Dr),pa),ya),Na),Ha),Qa),xs),Qt=class extends y{constructor(e,n,s){super(e,n,s),this.identifier=this.tokenizer.readIdentifier(),this.key=this.identifier.content,this.tokenizer.assert(this.key,"expected variable name"),this.tokenizer.skipBlank(),this.tokenizer.assert(this.tokenizer.peek()==="=",'expected "="'),this.tokenizer.advance(),this.value=new F(this.tokenizer.readFilteredValue(),this.liquid)}*render(e){e.bottom()[this.key]=yield this.value.value(e,this.liquid.options.lenientIf)}*arguments(){yield this.value}*localScope(){yield this.identifier}},ls=["offset","limit","reversed"],Zt=class extends y{constructor(e,n,s,i){super(e,n,s);let r=this.tokenizer.readIdentifier(),a=this.tokenizer.readIdentifier(),o=this.tokenizer.readValue();if(!r.size()||a.content!=="in"||!o)throw new Error(`illegal tag: ${e.getText()}`);this.variable=r.content,this.collection=o,this.hash=new E(this.tokenizer,s.options.keyValueSeparator),this.templates=[],this.elseTemplates=[];let l,c=i.parseStream(n).on("start",()=>l=this.templates).on("tag:else",d=>{Pe(d.args),l=this.elseTemplates}).on("tag:endfor",d=>{Pe(d.args),c.stop()}).on("template",d=>l.push(d)).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)});c.start()}*render(e,n){let s=this.liquid.renderer,i=Te(yield T(this.collection,e));if(!i.length){yield s.renderTemplates(this.elseTemplates,e,n);return}let r="continue-"+this.variable+"-"+this.collection.getText();e.push(G({continue:e.getRegister(r,{})}));let a=yield this.hash.render(e);e.pop(),i=(this.liquid.options.orderedFilterParameters?Object.keys(a).filter(c=>ls.includes(c)):ls.filter(c=>a[c]!==void 0)).reduce((c,d)=>d==="offset"?Ka(c,a.offset):d==="limit"?eo(c,a.limit):Xa(c),i),e.setRegister(r,(a.offset||0)+i.length);let l=G({forloop:new _e(i.length,this.collection.getText(),this.variable)});e.push(l);for(let c of i){if(l[this.variable]=c,e.continueCalled=e.breakCalled=!1,yield s.renderTemplates(this.templates,e,n),e.breakCalled)break;l.forloop.next()}e.continueCalled=e.breakCalled=!1,e.pop()}*children(){let e=this.templates.slice();return this.elseTemplates&&e.push(...this.elseTemplates),e}*arguments(){yield this.collection;for(let e of Object.values(this.hash.hash))z(e)&&(yield e)}blockScope(){return[this.variable,"forloop"]}};function Xa(t){return[...t].reverse()}function Ka(t,e){return t.slice(e)}function eo(t,e){return t.slice(0,e)}var Xt=class extends y{constructor(e,n,s,i){for(super(e,n,s),this.templates=[],this.identifier=this.readVariable(),this.variable=this.identifier.content;n.length;){let r=n.shift();if(se(r)&&r.name==="endcapture")return;this.templates.push(i.parseToken(r,n))}throw new Error(`tag ${e.getText()} not closed`)}readVariable(){let e=this.tokenizer.readIdentifier();if(e.content||(e=this.tokenizer.readQuoted(),e))return e;throw this.tokenizer.error("invalid capture name")}*render(e){let s=yield this.liquid.renderer.renderTemplates(this.templates,e);e.bottom()[this.variable]=s}*children(){return this.templates}*localScope(){yield this.identifier}},Kt=class extends y{constructor(e,n,s,i){super(e,n,s),this.branches=[],this.elseTemplates=[],this.value=new F(this.tokenizer.readFilteredValue(),this.liquid),this.elseTemplates=[];let r=[],a=0,o=i.parseStream(n).on("tag:when",l=>{if(a>0)return;r=[];let c=[];for(;!l.tokenizer.end();)c.push(l.tokenizer.readValueOrThrow()),l.tokenizer.skipBlank(),l.tokenizer.peek()===","?l.tokenizer.readTo(","):l.tokenizer.readTo("or");this.branches.push({values:c,templates:r})}).on("tag:else",()=>{a++,r=this.elseTemplates}).on("tag:endcase",()=>o.stop()).on("template",l=>{(r!==this.elseTemplates||a===1)&&r.push(l)}).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)});o.start()}*render(e,n){let s=this.liquid.renderer,i=yield f(yield this.value.value(e,e.opts.lenientIf)),r=!1;for(let a of this.branches)for(let o of a.values){let l=yield T(o,e,e.opts.lenientIf);if(yield Y(i,l)){yield s.renderTemplates(a.templates,e,n),r=!0;break}}r||(yield s.renderTemplates(this.elseTemplates,e,n))}*arguments(){yield this.value,yield*this.branches.flatMap(e=>e.values)}*children(){let e=this.branches.flatMap(n=>n.templates);return this.elseTemplates&&e.push(...this.elseTemplates),e}},en=class extends y{constructor(e,n,s){for(super(e,n,s);n.length;){let i=n.shift();if(se(i)&&i.name==="endcomment")return}throw new Error(`tag ${e.getText()} not closed`)}render(){}},tn=class extends y{constructor(e,n,s,i){super(e,n,s);let r=this.tokenizer;for(this.file=qn(r,this.liquid,i),this.currentFile=e.file;!r.end();){r.skipBlank();let a=r.p,o=r.readIdentifier();if((o.content==="with"||o.content==="for")&&(r.skipBlank(),r.peek()!==":")){let l=r.readValue();if(l){let c=r.p,d=r.readIdentifier(),p;d.content==="as"?p=r.readIdentifier():r.p=c;let h={value:l,alias:p&&p.content};o.content==="with"?this.with=h:this.forBinding=h,r.skipBlank(),r.peek()===","&&r.advance();continue}}r.p=a;break}this.hash=new E(r,s.options.keyValueSeparator)}*render(e,n){let{liquid:s,hash:i}=this,r=yield zn(this.file,e,s);S(r,()=>`illegal file path "${r}"`);let a=e.spawn(),o=a.bottom();if(Me(o,yield i.render(e)),this.with){let{value:l,alias:c}=this.with;o[c||r]=yield T(l,e)}if(this.forBinding){let{value:l,alias:c}=this.forBinding,d=Te(yield T(l,e));o.forloop=new _e(d.length,l.getText(),c);for(let p of d){o[c]=p;let h=yield s._parsePartialFile(r,a.sync,this.currentFile);yield s.renderer.renderTemplates(h,a,n),o.forloop.next()}}else{let l=yield s._parsePartialFile(r,a.sync,this.currentFile);yield s.renderer.renderTemplates(l,a,n)}}*children(e,n){return e&&g(this.file)?yield this.liquid._parsePartialFile(this.file,n,this.currentFile):[]}partialScope(){if(g(this.file)){let e=Object.keys(this.hash.hash);if(this.with){let{value:n,alias:s}=this.with;g(s)?e.push([s,n]):g(this.file)&&e.push([this.file,n])}if(this.forBinding){let{value:n,alias:s}=this.forBinding;g(s)?e.push([s,n]):g(this.file)&&e.push([this.file,n])}return{name:this.file,isolated:!0,scope:e}}}*arguments(){for(let e of Object.values(this.hash.hash))z(e)&&(yield e);if(this.with){let{value:e}=this.with;z(e)&&(yield e)}if(this.forBinding){let{value:e}=this.forBinding;z(e)&&(yield e)}}};function qn(t,e,n){if(e.options.dynamicPartials){let r=t.readValue();if(t.assert(r,"illegal file path"),r.getText()==="none")return;if(Gt(r)){let a=n.parse(Ei(r));return cs(a)}return r}let s=[...t.readFileNameTemplate(e.options)],i=cs(n.parseTokens(s));return i==="none"?void 0:i}function cs(t){return t.length===1&&wn(t[0].token)?t[0].token.getContent():t}function*zn(t,e,n){return typeof t=="string"?t:Array.isArray(t)?n.renderer.renderTemplates(t,e):yield T(t,e)}var nn=class extends y{constructor(e,n,s,i){super(e,n,s);let{tokenizer:r}=e;this.file=qn(r,this.liquid,i),this.currentFile=e.file;let a=r.p;r.readIdentifier().content==="with"?(r.skipBlank(),r.peek()!==":"?this.withVar=r.readValue():r.p=a):r.p=a,this.hash=new E(r,s.options.jekyllInclude||s.options.keyValueSeparator)}*render(e,n){let{liquid:s,hash:i,withVar:r}=this,{renderer:a}=s,o=yield zn(this.file,e,s);S(o,()=>`illegal file path "${o}"`);let l=e.saveRegister("blocks","blockMode");e.setRegister("blocks",{}),e.setRegister("blockMode",te.OUTPUT);let c=G(yield i.render(e));r&&(c[o]=yield T(r,e));let d=yield s._parsePartialFile(o,e.sync,this.currentFile);e.push(e.opts.jekyllInclude?G({include:c}):c),yield a.renderTemplates(d,e,n),e.pop(),e.restoreRegister(l)}*children(e,n){return e&&g(this.file)?yield this.liquid._parsePartialFile(this.file,n,this.currentFile):[]}partialScope(){if(g(this.file)){let e;return this.liquid.options.jekyllInclude?e=["include"]:(e=Object.keys(this.hash.hash),this.withVar&&e.push([this.file,this.withVar])),{name:this.file,isolated:!1,scope:e}}}*arguments(){yield*Object.values(this.hash.hash).filter(z),z(this.file)&&(yield this.file),z(this.withVar)&&(yield this.withVar)}},sn=class extends y{constructor(e,n,s){super(e,n,s),this.identifier=this.tokenizer.readIdentifier(),this.variable=this.identifier.content}render(e,n){let s=e.environments;qe(s[this.variable])||(s[this.variable]=0),n.write(u(--s[this.variable]))}*localScope(){yield this.identifier}},rn=class extends y{constructor(e,n,s){super(e,n,s),this.candidates=[];let i=this.tokenizer.readValue();for(this.tokenizer.skipBlank(),i&&(this.tokenizer.peek()===":"?(this.group=i,this.tokenizer.advance()):this.candidates.push(i));!this.tokenizer.end();){let r=this.tokenizer.readValue();r&&this.candidates.push(r),this.tokenizer.readTo(",")}this.tokenizer.assert(this.candidates.length,()=>`empty candidates: "${e.getText()}"`)}*render(e,n){let i=`cycle:${yield T(this.group,e)}:`+this.candidates.join(","),r=e.getRegister("cycle",{}),a=r[i];a===void 0&&(a=r[i]=0);let o=this.candidates[a];return a=(a+1)%this.candidates.length,r[i]=a,yield T(o,e)}*arguments(){yield*this.candidates,this.group&&(yield this.group)}},an=class extends y{constructor(e,n,s,i){super(e,n,s),this.branches=[];let r=[];i.parseStream(n).on("start",()=>this.branches.push({value:new F(e.tokenizer.readFilteredValue(),this.liquid),templates:r=[]})).on("tag:elsif",a=>{S(!this.elseTemplates,"unexpected elsif after else"),this.branches.push({value:new F(a.tokenizer.readFilteredValue(),this.liquid),templates:r=[]})}).on("tag:else",a=>{Pe(a.args),S(!this.elseTemplates,"duplicated else"),r=this.elseTemplates=[]}).on("tag:endif",function(a){Pe(a.args),this.stop()}).on("template",a=>r.push(a)).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)}).start()}*render(e,n){let s=this.liquid.renderer;for(let{value:i,templates:r}of this.branches){let a=yield f(yield i.value(e,e.opts.lenientIf));if(ee(a,e)){yield s.renderTemplates(r,e,n);return}}yield s.renderTemplates(this.elseTemplates||[],e,n)}*children(){let e=this.branches.flatMap(n=>n.templates);return this.elseTemplates&&e.push(...this.elseTemplates),e}arguments(){return this.branches.map(e=>e.value)}},on=class extends y{constructor(e,n,s){super(e,n,s),this.identifier=this.tokenizer.readIdentifier(),this.variable=this.identifier.content}render(e,n){let s=e.environments;qe(s[this.variable])||(s[this.variable]=0);let i=s[this.variable];s[this.variable]++,n.write(u(i))}*localScope(){yield this.identifier}},ln=class extends y{constructor(e,n,s,i){super(e,n,s),this.file=qn(this.tokenizer,this.liquid,i),this.currentFile=e.file,this.args=new E(this.tokenizer,s.options.keyValueSeparator),this.templates=i.parseTokens(n)}*render(e,n){let{liquid:s,args:i,file:r}=this,{renderer:a}=s;if(r===void 0){e.setRegister("blockMode",te.OUTPUT),yield a.renderTemplates(this.templates,e,n);return}let o=yield zn(this.file,e,s);S(o,()=>`illegal file path "${o}"`);let l=yield s._parseLayoutFile(o,e.sync,this.currentFile);e.setRegister("blockMode",te.STORE);let c=yield a.renderTemplates(this.templates,e),d=e.getRegister("blocks",{});d[""]===void 0&&(d[""]=(p,h)=>h.write(c)),e.setRegister("blockMode",te.OUTPUT),e.push(G(yield i.render(e))),yield a.renderTemplates(l,e,n),e.pop()}*children(e){let n=this.templates.slice();return e&&g(this.file)&&n.push(...yield this.liquid._parsePartialFile(this.file,!0,this.currentFile)),n}*arguments(){for(let e of Object.values(this.args.hash))z(e)&&(yield e);z(this.file)&&(yield this.file)}partialScope(){if(g(this.file))return{name:this.file,isolated:!1,scope:Object.keys(this.args.hash)}}},cn=class extends y{constructor(e,n,s,i){super(e,n,s),this.templates=[];let r=/\w+/.exec(e.args);for(this.block=r?r[0]:"";n.length;){let a=n.shift();if(se(a)&&a.name==="endblock")return;let o=i.parseToken(a,n);this.templates.push(o)}throw new Error(`tag ${e.getText()} not closed`)}*render(e,n){let s=this.getBlockRender(e);e.getRegister("blockMode")===te.STORE?e.getRegister("blocks",{})[this.block]=s:yield s(new Ne,n)}getBlockRender(e){let n=this,{liquid:s,templates:i}=this,r=e.getRegister("blocks",{})[this.block],a=function*(o,l){let c=e.getRegister("blockStack",[]);if(c.includes(n))throw new Error("block tag cannot be nested");c.push(n),e.push(G({block:o})),yield s.renderer.renderTemplates(i,e,l),e.pop(),c.pop()};return r?(o,l)=>r(new Ne(c=>a(o,c)),l):a}*children(){return this.templates}blockScope(){return["block"]}},dn=class extends y{constructor(e,n,s){for(super(e,n,s),this.tokens=[];n.length;){let i=n.shift();if(se(i)&&i.name==="endraw")return;this.tokens.push(i)}throw new Error(`tag ${e.getText()} not closed`)}render(){return this.tokens.map(e=>e.getText()).join("")}},un=class extends _e{constructor(e,n,s,i){super(e,s,i),this.length=e,this.cols=n}row(){return Math.floor(this.i/this.cols)+1}col0(){return this.i%this.cols}col(){return this.col0()+1}col_first(){return this.col0()===0}col_last(){return this.col()===this.cols}},pn=class extends y{constructor(e,n,s,i){super(e,n,s);let r=this.tokenizer.readIdentifier();this.tokenizer.skipBlank();let a=this.tokenizer.readIdentifier(),o=this.tokenizer.readValue();if(a.content!=="in"||!o)throw new Error(`illegal tag: ${e.getText()}`);this.variable=r.content,this.collection=o,this.args=new E(this.tokenizer,s.options.keyValueSeparator),this.templates=[];let l,c=i.parseStream(n).on("start",()=>l=this.templates).on("tag:endtablerow",()=>c.stop()).on("template",d=>l.push(d)).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)});c.start()}*render(e,n){let s=Te(yield T(this.collection,e)),i=yield this.args.render(e),r=i.offset||0,a=i.limit===void 0?s.length:i.limit;s=s.slice(r,r+a);let o=i.cols||s.length,l=this.liquid.renderer,c=new un(s.length,o,this.collection.getText(),this.variable),d=G({tablerowloop:c});e.push(d);for(let p=0;p<s.length;p++,c.next())d[this.variable]=s[p],c.col0()===0&&(c.row()!==1&&n.write("</tr>"),n.write(`<tr class="row${c.row()}">`)),n.write(`<td class="col${c.col()}">`),yield l.renderTemplates(this.templates,e,n),n.write("</td>");s.length&&n.write("</tr>"),e.pop()}*children(){return this.templates}*arguments(){yield this.collection;for(let e of Object.values(this.args.hash))z(e)&&(yield e)}blockScope(){return[this.variable,"tablerowloop"]}},hn=class extends y{constructor(e,n,s,i){super(e,n,s),this.branches=[],this.elseTemplates=[];let r=[],a=0;i.parseStream(n).on("start",()=>this.branches.push({value:new F(e.tokenizer.readFilteredValue(),this.liquid),test:nt,templates:r=[]})).on("tag:elsif",o=>{if(a>0){r=[];return}this.branches.push({value:new F(o.tokenizer.readFilteredValue(),this.liquid),test:ee,templates:r=[]})}).on("tag:else",()=>{a++,r=this.elseTemplates}).on("tag:endunless",function(){this.stop()}).on("template",o=>{(r!==this.elseTemplates||a===1)&&r.push(o)}).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)}).start()}*render(e,n){let s=this.liquid.renderer;for(let{value:i,test:r,templates:a}of this.branches){let o=yield f(yield i.value(e,e.opts.lenientIf));if(r(o,e)){yield s.renderTemplates(a,e,n);return}}yield s.renderTemplates(this.elseTemplates,e,n)}*children(){let e=this.branches.flatMap(n=>n.templates);return this.elseTemplates&&e.push(...this.elseTemplates),e}arguments(){return this.branches.map(e=>e.value)}},fn=class extends y{render(e,n){e.breakCalled=!0}},gn=class extends y{render(e,n){e.continueCalled=!0}},mn=class extends y{constructor(e,n,s){super(e,n,s),this.tokenizer.skipBlank(),this.tokenizer.end()||(this.value=new F(this.tokenizer.readFilteredValue(),this.liquid))}*render(e,n){if(!this.value)return;let s=yield f(yield this.value.value(e,!1));n.write(s)}*arguments(){this.value&&(yield this.value)}},yn=class extends y{constructor(e,n,s,i){super(e,n,s);let r=this.tokenizer.readLiquidTagTokens(this.liquid.options);this.templates=i.parseTokens(r)}*render(e,n){yield this.liquid.renderer.renderTemplates(this.templates,e,n)}*children(){return this.templates}},bn=class extends y{constructor(e,n,s){if(super(e,n,s),e.args.search(/\n\s*[^#\s]/g)!==-1)throw new Error("every line of an inline comment must start with a '#' character")}render(){}},to={assign:Qt,for:Zt,capture:Xt,case:Kt,comment:en,include:nn,render:tn,decrement:sn,increment:on,cycle:rn,if:an,layout:ln,block:cn,raw:dn,tablerow:pn,unless:hn,break:fn,continue:gn,echo:mn,liquid:yn,"#":bn},Xe=class t{constructor(e={}){this.renderer=new Nt,this.filters=Object.create(null),this.tags=Object.create(null),this.options=ir(e),this.parser=new B(this),Vn(to,(n,s)=>this.registerTag(s,n)),Vn(Za,(n,s)=>this.registerFilter(s,n))}parse(e,n){return new B(this).parse(e,n)}_render(e,n,s){let i=n instanceof K?n:new K(n,this.options,s,{liquid:this});return this.renderer.renderTemplates(e,i)}render(e,n,s){return w(this,void 0,void 0,function*(){return N(this._render(e,n,Object.assign(Object.assign({},s),{sync:!1})))})}renderSync(e,n,s){return M(this._render(e,n,Object.assign(Object.assign({},s),{sync:!0})))}renderToNodeStream(e,n,s={}){let i=new K(n,this.options,s,{liquid:this});return this.renderer.renderTemplatesToNodeStream(e,i)}_parseAndRender(e,n,s){let i=this.parse(e);return this._render(i,n,s)}parseAndRender(e,n,s){return w(this,void 0,void 0,function*(){return N(this._parseAndRender(e,n,Object.assign(Object.assign({},s),{sync:!1})))})}parseAndRenderSync(e,n,s){return M(this._parseAndRender(e,n,Object.assign(Object.assign({},s),{sync:!0})))}_parsePartialFile(e,n,s){return new B(this).parseFile(e,n,pe.Partials,s)}_parseLayoutFile(e,n,s){return new B(this).parseFile(e,n,pe.Layouts,s)}_parseFile(e,n,s,i){return new B(this).parseFile(e,n,s,i)}parseFile(e,n){return w(this,void 0,void 0,function*(){return N(new B(this).parseFile(e,!1,n))})}parseFileSync(e,n){return M(new B(this).parseFile(e,!0,n))}*_renderFile(e,n,s){let i=yield this._parseFile(e,s.sync,s.lookupType);return yield this._render(i,n,s)}renderFile(e,n,s){return w(this,void 0,void 0,function*(){return N(this._renderFile(e,n,Object.assign(Object.assign({},s),{sync:!1})))})}renderFileSync(e,n,s){return M(this._renderFile(e,n,Object.assign(Object.assign({},s),{sync:!0})))}renderFileToNodeStream(e,n,s){return w(this,void 0,void 0,function*(){let i=yield this.parseFile(e);return this.renderToNodeStream(i,n,s)})}_evalValue(e,n){let s=new F(e,this),i=n instanceof K?n:new K(n,this.options,{},{liquid:this});return s.value(i)}evalValue(e,n){return w(this,void 0,void 0,function*(){return N(this._evalValue(e,n))})}evalValueSync(e,n){return M(this._evalValue(e,n))}registerFilter(e,n){this.filters[e]=n}unregisterFilter(e){delete this.filters[e]}registerTag(e,n){this.tags[e]=k(n)?n:cr(n)}plugin(e){return e.call(this,t)}express(){let e=this,n=!0;return function(s,i,r){if(n){n=!1;let a=Ce(this.root);e.options.root.unshift(...a),e.options.layouts.unshift(...a),e.options.partials.unshift(...a)}e.renderFile(s,i).then(a=>r(null,a),r)}}analyze(e,n={}){return w(this,void 0,void 0,function*(){return H(e,n)})}analyzeSync(e,n={}){return J(e,n)}parseAndAnalyze(e,n,s={}){return w(this,void 0,void 0,function*(){return H(this.parse(e,n),s)})}parseAndAnalyzeSync(e,n,s={}){return J(this.parse(e,n),s)}variables(e,n={}){return w(this,void 0,void 0,function*(){let s=yield H(g(e)?this.parse(e):e,n);return Object.keys(s.variables)})}variablesSync(e,n={}){let s=J(g(e)?this.parse(e):e,n);return Object.keys(s.variables)}fullVariables(e,n={}){return w(this,void 0,void 0,function*(){let s=yield H(g(e)?this.parse(e):e,n);return Array.from(new Set(Object.values(s.variables).flatMap(i=>i.map(r=>String(r)))))})}fullVariablesSync(e,n={}){let s=J(g(e)?this.parse(e):e,n);return Array.from(new Set(Object.values(s.variables).flatMap(i=>i.map(r=>String(r)))))}variableSegments(e,n={}){return w(this,void 0,void 0,function*(){let s=yield H(g(e)?this.parse(e):e,n);return Array.from(Ae(Object.values(s.variables).flatMap(i=>i.map(r=>r.toArray()))))})}variableSegmentsSync(e,n={}){let s=J(g(e)?this.parse(e):e,n);return Array.from(Ae(Object.values(s.variables).flatMap(i=>i.map(r=>r.toArray()))))}globalVariables(e,n={}){return w(this,void 0,void 0,function*(){let s=yield H(g(e)?this.parse(e):e,n);return Object.keys(s.globals)})}globalVariablesSync(e,n={}){let s=J(g(e)?this.parse(e):e,n);return Object.keys(s.globals)}globalFullVariables(e,n={}){return w(this,void 0,void 0,function*(){let s=yield H(g(e)?this.parse(e):e,n);return Array.from(new Set(Object.values(s.globals).flatMap(i=>i.map(r=>String(r)))))})}globalFullVariablesSync(e,n={}){let s=J(g(e)?this.parse(e):e,n);return Array.from(new Set(Object.values(s.globals).flatMap(i=>i.map(r=>String(r)))))}globalVariableSegments(e,n={}){return w(this,void 0,void 0,function*(){let s=yield H(g(e)?this.parse(e):e,n);return Array.from(Ae(Object.values(s.globals).flatMap(i=>i.map(r=>r.toArray()))))})}globalVariableSegmentsSync(e,n={}){let s=J(g(e)?this.parse(e):e,n);return Array.from(Ae(Object.values(s.globals).flatMap(i=>i.map(r=>r.toArray()))))}};var it=class extends Xe{constructor(e={}){super({...e,fs:Mn})}};var Ps=new URL("..","file:///repo/preview/server.mjs"),re=JSON.parse(X(new URL("scripts/catalog.json",Ps),"utf8")),Bs=new URL("design/out/",Ps),rt=[{iso_code:"US",name:"United States",currency:{iso_code:"USD",symbol:"$"}},{iso_code:"CA",name:"Canada",currency:{iso_code:"CAD",symbol:"$"}},{iso_code:"GB",name:"United Kingdom",currency:{iso_code:"GBP",symbol:"\xA3"}},{iso_code:"DE",name:"Germany",currency:{iso_code:"EUR",symbol:"\u20AC"}},{iso_code:"FR",name:"France",currency:{iso_code:"EUR",symbol:"\u20AC"}},{iso_code:"NL",name:"Netherlands",currency:{iso_code:"EUR",symbol:"\u20AC"}},{iso_code:"AU",name:"Australia",currency:{iso_code:"AUD",symbol:"$"}}],no={USD:1,CAD:1.37,GBP:.79,EUR:.92,AUD:1.52},so=(t,e)=>e==="USD"?t:Math.round(t*no[e]/100)*100,ie=class extends j{constructor(e){super(),this.value=e}valueOf(){return typeof this.value=="object"?JSON.stringify(this.value):this.value}toString(){return String(this.valueOf())}},On=(t,e)=>{let n=`/img/${t}`,s={id:t,src:n,width:1400,height:1400,aspect_ratio:1,alt:e,media_type:"image"};return s.preview_image=s,s},Fn=re.subscription.plans.map((t,e)=>({id:9001+e,name:`Delivered every ${t} days`,options:[{name:"Delivery every",value:`${t} days`}],price_adjustments:[{value_type:"percentage",value:re.subscription.percentage}]})),Ns=Object.fromEntries(Fn.map(t=>[String(t.id),t])),ze=2e3,at=[];for(let t of re.tonics)at.push({id:ze++,handle:t.handle,title:t.title,tags:t.tags,description:t.description,media:["pouch","glass","sticks"].filter(e=>fe(new URL(`${t.handle}-${e}.png`,Bs))).map(e=>On(`${t.handle}-${e}.png`,`${t.title} ${e}`)),variants:[{id:ze++,title:"30 sticks",usd:t.price*100,qty:400},{id:ze++,title:"15 sticks",usd:t.price15*100,qty:400}],subscribable:!0,meta:{local_name:t.local,benefit:t.benefit,color:t.color,servings:30,ritual:t.ritual,supplement_facts:t.facts},ingredientHandles:t.ingredients});var $=re.accessory;at.push({id:ze++,handle:$.handle,title:$.title,tags:$.tags,description:$.description,media:[On(`${$.handle}.png`,$.title)],variants:[{id:ze++,title:"Default Title",usd:$.price*100,qty:60}],subscribable:!1,meta:{local_name:$.local,benefit:$.benefit,color:$.color},ingredientHandles:[]});var ot=new Map;for(let t of at)for(let e of t.variants)ot.set(String(e.id),{p:t,v:e});function Fe(t){let e={};for(let a of at){let o=a.variants.map(l=>{let c=so(l.usd,t);return{id:l.id,title:l.title,price:c,compare_at_price:null,available:l.qty>0,inventory_quantity:l.qty,selling_plan_allocations:a.subscribable?Fn.map(d=>({selling_plan:d,price:Math.round(c*(1-d.price_adjustments[0].value/100)),compare_at_price:c})):[]}});e[a.handle]={id:a.id,handle:a.handle,title:a.title,url:`/products/${a.handle}`,tags:a.tags,description:a.description,media:a.media,featured_media:a.media[0],featured_image:a.media[0],variants:o,selected_or_first_available_variant:o.find(l=>l.available)??o[0],price:o[0].price,available:o.some(l=>l.available),has_only_default_variant:o.length===1&&o[0].title==="Default Title",options:o.length===1&&o[0].title==="Default Title"?["Title"]:["Size"],requires_selling_plan:!1,selling_plan_groups:a.subscribable?[{name:re.subscription.name,options:[{name:"Delivery every"}],selling_plans:Fn}]:[],metafields:{racik:Object.fromEntries(Object.entries(a.meta).filter(([,l])=>l!=null).map(([l,c])=>[l,new ie(c)]))},_ingredients:a.ingredientHandles}}let n={};for(let a of re.ingredients){let o=Object.fromEntries(["name","local_name","latin_name","origin","harvest","color","story"].map(c=>[c,new ie(a[c])])),l=`ingredient-${a.handle}.png`;n[a.handle]={...o,illustration:new ie(fe(new URL(l,Bs))?On(l,a.name):null),handle:a.handle,system:{url:`/pages/ingredient/${a.handle}`,handle:a.handle,type:"ingredient"},found_in:new ie(Object.values(e).filter(c=>c._ingredients.includes(a.handle)))}}for(let a of Object.values(e))a._ingredients.length&&(a.metafields.racik.ingredients=new ie(a._ingredients.map(o=>n[o])));let s=re.tonics.map(a=>e[a.handle]),i=Object.values(e),r={tonics:{handle:"tonics",title:"Tonics",url:"/collections/tonics",description:"<p>Six daily jamu tonics, each a 30-stick pouch.</p>",products:s,products_count:s.length},all:{handle:"all",title:"Shop all",url:"/collections/all",description:"",products:i,products_count:i.length}};for(let a of Object.values(r))a.all_tags=[...new Set(a.products.flatMap(o=>o.tags))].sort();return{products:e,ingredients:n,collections:r,metaobjects:{ingredient:{values:Object.values(n)}}}}var Ms={"main-menu":{links:[{title:"Shop tonics",url:"/collections/tonics"},{title:"Build a pack",url:"/pages/build-a-pack"},{title:"Ingredients",url:"/#ingredients"}]},footer:{links:[{title:"Shipping & duties",url:"/pages/shipping"},{title:"Manage subscription",url:"/account"},{title:"Contact",url:"/pages/contact"},{title:"Privacy",url:"/policies/privacy-policy"}]}},lt={quiz:{handle:"quiz",title:"Find your blend",url:"/pages/quiz",template_suffix:"quiz"},"build-a-pack":{handle:"build-a-pack",title:"Build a pack",url:"/pages/build-a-pack",template_suffix:"pack"}},Is={"hero-racik.png":{src:"/img/hero-racik.png",width:1600,height:1760,aspect_ratio:1600/1760,alt:"Racik pouches and a glass of Focus"}};var Vs=[{min:3,percentage:10},{min:5,percentage:15}];function io(t){try{let e=JSON.parse(t?.value??"{}").tiers;return!Array.isArray(e)||!e.length?Vs:e.map(n=>({min:Number(n.min),percentage:Number(n.percentage)})).filter(n=>n.min>0&&n.percentage>0&&n.percentage<=100).sort((n,s)=>n.min-s.min)}catch{return Vs}}function ro(t,e){let n=null;for(let s of e)t>=s.min&&(n=s);return n}function Us(t){if(!t.discount.discountClasses.includes("PRODUCT"))return{operations:[]};let e=io(t.discount.metafield),n=new Map;for(let i of t.cart.lines){let r=i.pack?.value;if(!r)continue;let a=n.get(r)??{units:0,lineIds:[]};a.units+=i.quantity,a.lineIds.push(i.id),n.set(r,a)}let s=[];for(let{units:i,lineIds:r}of n.values()){let a=ro(i,e);a&&s.push({message:`Pack of ${i}: ${a.percentage}% off`,targets:r.map(o=>({cartLine:{id:o}})),value:{percentage:{value:a.percentage}}})}return s.length?{operations:[{productDiscountsAdd:{candidates:s,selectionStrategy:"ALL"}}]}:{operations:[]}}var Dn=new URL("..","file:///repo/preview/server.mjs"),ae=new URL("theme/",Dn),jn=Number(process.env.PORT||9494),ut=t=>ft(new URL(t,ae),"utf8"),ao=JSON.parse(X(new URL("locales/en.default.json",ae),"utf8")),oo=JSON.parse(X(new URL("scripts/catalog.json",Dn),"utf8")).tiers,lo={USD:t=>`$${t.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,CAD:t=>`$${t.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,AUD:t=>`$${t.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,GBP:t=>`\xA3${t.toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2})}`,EUR:t=>`\u20AC${t.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})}`},Ln=(t,e)=>lo[e](Number(t||0)/100),En=class extends j{constructor(e){super(),this.hex=e;let n=parseInt(e.slice(1),16);Object.assign(this,{red:n>>16&255,green:n>>8&255,blue:n&255})}valueOf(){return this.hex}toString(){return this.hex}};function co(t,e,n){if(e==null||e==="")return null;switch(t){case"color":return new En(e);case"collection":return n.collections[e]??null;case"product":return n.products[e]??null;case"page":return lt[e]??null;case"image_picker":return Is[String(e).replace("shopify://shop_images/","")]??null;case"link_list":return Ms[e]??{links:[]};default:return e}}function Rn(t=[],e={},n){let s={};for(let i of t)i.id&&(s[i.id]=co(i.type,e[i.id]??i.default,n));return s}var uo=JSON.parse(X(new URL("config/settings_schema.json",ae),"utf8")).flatMap(t=>t.settings??[]),po=JSON.parse(X(new URL("config/settings_data.json",ae),"utf8")).presets.Default,oe=new it({root:gt(ae),partials:gt(new URL("snippets/",ae)),extname:".liquid",strictFilters:!0}),Oe=t=>Object.fromEntries(t.filter(Array.isArray)),ct=t=>t.globals.__currency||"USD",Cn=class{constructor(e,n){this.img=e,this.width=n}toString(){return`${this.img.src}${this.width?`?width=${this.width}`:""}`}toJSON(){return this.toString()}},Hs={t(t,...e){let n=Oe(e),s=t.split(".").reduce((i,r)=>i?.[r],ao);return s&&typeof s=="object"&&(s=Number(n.count)===1?s.one:s.other),typeof s!="string"?`translation missing: ${t}`:s.replace(/\{\{\s*(\w+)\s*\}\}/g,(i,r)=>String(n[r]??""))},money(t){return Ln(t,ct(this.context))},money_with_currency(t){return`${Ln(t,ct(this.context))} ${ct(this.context)}`},money_without_trailing_zeros(t){return Ln(t,ct(this.context)).replace(/[.,]00$/,"")},money_without_currency(t){return(Number(t)/100).toFixed(2)},color_brightness(t){let e=parseInt(String(t).replace("#",""),16);return Math.round(((e>>16&255)*299+(e>>8&255)*587+(e&255)*114)/1e3)},asset_url:t=>`/assets/${t}`,stylesheet_tag:t=>`<link href="${t}" rel="stylesheet">`,preload_tag:(t,...e)=>`<link href="${t}" rel="preload" as="${Oe(e).as}" type="${Oe(e).type}" crossorigin>`,image_url:(t,...e)=>t?new Cn(t.preview_image??t,Oe(e).width):"",image_tag(t,...e){if(!t)return"";let n=Oe(e),s=t.img??{},i={src:String(t),alt:n.alt??s.alt??"",width:s.width,height:s.height};n.widths&&(i.srcset=String(n.widths).split(",").map(r=>`${s.src}?width=${r.trim()} ${r.trim()}w`).join(", "));for(let[r,a]of Object.entries(n))["widths","preload","alt","height"].includes(r)||(i[r]=a);return`<img ${Object.entries(i).filter(([,r])=>r!=null).map(([r,a])=>`${r}="${String(a).replace(/"/g,"&quot;")}"`).join(" ")}>`},placeholder_svg_tag:()=>'<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="#ddd"/></svg>',structured_data:()=>"{}",default_pagination:()=>"",handleize:t=>String(t).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),handle:t=>String(t).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")};for(let[t,e]of Object.entries(Hs))oe.registerFilter(t,e);oe.registerTag("schema",class extends y{constructor(t,e,n){for(super(t,e,n);e.length&&e.shift().name!=="endschema";);}*render(){}});var ho={product:"/cart/add",customer:"/contact",localization:"/localization"};oe.registerTag("form",class extends y{constructor(t,e,n){super(t,e,n);let s=t.args.match(/^\s*'([^']+)'\s*(?:,\s*([a-z_.]+)(?=\s*(?:,|$)))?\s*,?(.*)$/s);this.type=s[1],this.hash=new E(s[3]??""),this.tpls=[];let i=n.parser.parseStream(e).on("tag:endform",()=>i.stop()).on("template",r=>this.tpls.push(r));i.start()}*render(t,e){let n=yield this.hash.render(t);e.write(`<form method="post" action="${ho[this.type]??"/"}" ${Object.entries(n).map(([s,i])=>`${s}="${i}"`).join(" ")}><input type="hidden" name="form_type" value="${this.type}">`),t.push({form:{errors:null,"posted_successfully?":!1}}),yield this.liquid.renderer.renderTemplates(this.tpls,t,e),t.pop(),e.write("</form>")}});oe.registerTag("paginate",class extends y{constructor(t,e,n){super(t,e,n),this.tpls=[];let s=n.parser.parseStream(e).on("tag:endpaginate",()=>s.stop()).on("template",i=>this.tpls.push(i));s.start()}*render(t,e){t.push({paginate:{pages:1,current_page:1}}),yield this.liquid.renderer.renderTemplates(this.tpls,t,e),t.pop()}});async function pt(t,e={},n=t,s,i=1){let r=await ut(`sections/${t}.liquid`),a=r.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/),o=a?JSON.parse(a[1]):{},l=Object.fromEntries((o.blocks??[]).map(m=>[m.type,m])),c=(e.block_order??Object.keys(e.blocks??{})).map(m=>({id:m,type:e.blocks[m].type,settings:Rn(l[e.blocks[m].type]?.settings,e.blocks[m].settings,s.__data),shopify_attributes:""})),d={id:n,index:i,settings:Rn(o.settings,e.settings,s.__data),blocks:c},p=await oe.parseAndRender(r,{section:d},{globals:s}),h=o.tag??"div";return`<${h} id="shopify-section-${n}" class="shopify-section">${p}</${h}>`}for(let t of["section","sections"])oe.registerTag(t,class extends y{constructor(e,n,s){super(e,n,s),this.arg=e.args.trim().replace(/['"]/g,"")}*render(e,n){let s=e.getAll();if(t==="section")return n.write(yield pt(this.arg,{},this.arg,s));let i=JSON.parse(yield ut(`sections/${this.arg}.json`));for(let r of i.order)n.write(yield pt(i.sections[r].type,i.sections[r],`sections--1__${r}`,s))}});var Q=[];function fo(t,e){let n={cart:{lines:Q.map((r,a)=>({id:`L${a}`,quantity:r.quantity,pack:r.properties._pack?{value:r.properties._pack}:null}))},discount:{discountClasses:["PRODUCT"],metafield:{value:JSON.stringify({tiers:oo})}}},s={};for(let r of Us(n).operations)for(let a of r.productDiscountsAdd.candidates)for(let o of a.targets)s[o.cartLine.id]=a.value.percentage.value;let i=Q.map((r,a)=>{let{p:o}=ot.get(String(r.id)),l=t.products[o.handle],c=l.variants.find(P=>String(P.id)===String(r.id)),d=r.selling_plan?Ns[String(r.selling_plan)]:null,h=(d?c.selling_plan_allocations.find(P=>P.selling_plan.id===d.id).price:c.price)*r.quantity,m=Math.round(h*(1-(s[`L${a}`]||0)/100));return{key:`${r.id}:${a}`,url:l.url,image:l.featured_media,product:l,variant:c,quantity:r.quantity,properties:r.properties,selling_plan_allocation:d?{selling_plan:d}:null,original_line_price:h,final_line_price:m}});return{items:i,item_count:i.reduce((r,a)=>r+a.quantity,0),total_price:i.reduce((r,a)=>r+a.final_line_price,0),currency:{iso_code:e}}}function je(t,e,n={}){let s=/country=([A-Z]{2})/.exec(t.headers.cookie||"")?.[1]||"US",i=rt.find(c=>c.iso_code===s)??rt[0],r=i.currency.iso_code,a=Fe(r),o=/consent=1/.test(t.headers.cookie||""),l=["GB","DE","FR","NL"].includes(i.iso_code)&&!o;return{__data:a,__currency:r,settings:Rn(uo,po,a),shop:{name:"Racik",description:"Indonesian botanical tonics.",metaobjects:a.metaobjects},cart:fo(a,r),localization:{country:i,available_countries:rt},request:{locale:{iso_code:"en"},page_type:n.template?.name??"index"},routes:{root_url:"/",cart_url:"/cart",cart_add_url:"/cart/add",cart_change_url:"/cart/change",cart_update_url:"/cart/update",all_products_collection_url:"/collections/all"},canonical_url:e.href,page_title:"Racik",page_description:"Indonesian botanical tonics: turmeric, red ginger and butterfly pea, grown in Java and Bali. Subscribe and save 15%.",content_for_header:`<script>
      window.Shopify = {
        analytics: { publish(n, d) { console.log('[analytics]', n, JSON.stringify(d)); } },
        loadFeatures(f, cb) { cb(); },
        customerPrivacy: {
          shouldShowBanner() { return ${l}; },
          setTrackingConsent(c, cb) { document.cookie = 'consent=1; path=/'; cb(); },
        },
      };
    <\/script>`,current_tags:n.current_tags??null,...n}}async function R(t,e,n,s={}){let i=JSON.parse(await ut(`templates/${t}.json`)),r=je(e,n,{template:{name:t.split(".")[0].split("/")[0]},...s}),a=n.searchParams.get("section_id"),o="",l=0;for(let c of i.order){let d=`template--1__${c}`;a&&a!==d||(o+=await pt(i.sections[c].type,i.sections[c],d,r,++l))}return a?o:oe.parseAndRender(await ut("layout/theme.liquid"),{},{globals:{...r,content_for_layout:o}})}async function An(t,e,n){let s={};for(let i of t)i==="cart-drawer"?s[i]=await pt("cart-drawer",{},"cart-drawer",je(e,n)):i.startsWith("template--1__")&&(s[i]=await R("cart",e,new URL(`/cart?section_id=${i}`,n)));return s}async function dt(t){let e=[];for await(let i of t)e.push(i);let n=Buffer.concat(e).toString(),s=t.headers["content-type"]||"";if(s.includes("application/json"))return JSON.parse(n||"{}");if(s.includes("multipart/form-data")){let i={};for(let r of n.split(/-{2,}\S+/)){let a=r.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/);a&&(i[a[1]]=a[2])}return i}return Object.fromEntries(new URLSearchParams(n))}var go={".css":"text/css",".js":"text/javascript",".png":"image/png",".woff2":"font/woff2"};Nn(async(t,e)=>{let n=new URL(t.url,`http://localhost:${jn}`),s=n.pathname,i=(a,o,l="text/html; charset=utf-8",c={})=>{e.writeHead(a,{"Content-Type":l,...c}),e.end(o)},r=(a,o)=>i(a,JSON.stringify(o),"application/json");try{if(s==="/favicon.ico")return i(204,"");if(s.startsWith("/assets/")||s.startsWith("/img/")){let o=s.startsWith("/assets/")?new URL(`assets/${s.slice(8)}`,ae):new URL(`design/out/${s.slice(5)}`,Dn);return fe(o)?i(200,await ft(o),go[Bn(s)]):i(404,"not found")}if(t.method==="POST"&&s==="/localization"){let o=await dt(t);return i(302,"","text/plain",{"Set-Cookie":`country=${o.country_code}; Path=/`,Location:t.headers.referer||"/"})}if(t.method==="POST"&&s==="/cart/add.js"){let o=await dt(t),l=o.items??[{id:o.id,quantity:Number(o.quantity||1),selling_plan:o.selling_plan||null,properties:{}}];for(let d of l){if(!ot.has(String(d.id)))return r(404,{status:404,message:"Cart Error",description:"Product not found"});let p=d.properties??{},h=Q.find(m=>String(m.id)===String(d.id)&&String(m.selling_plan??"")===String(d.selling_plan??"")&&JSON.stringify(m.properties)===JSON.stringify(p));h?h.quantity+=Number(d.quantity||1):Q.push({id:Number(d.id),quantity:Number(d.quantity||1),selling_plan:d.selling_plan?Number(d.selling_plan):null,properties:p})}let c=Array.isArray(o.sections)?o.sections:String(o.sections||"").split(",").filter(Boolean);return r(200,{items:l,sections:await An(c,t,n)})}if(t.method==="POST"&&s==="/cart/change.js"){let o=await dt(t),l=Number(o.line)-1;return Number(o.quantity)===0?Q.splice(l,1):Q[l].quantity=Number(o.quantity),r(200,{sections:await An(o.sections??[],t,n)})}if(t.method==="POST"&&s==="/cart/update.js"){let o=await dt(t),l=Object.entries(o.updates??{}),c=p=>Number(p.split(":")[1]),d=new Set(l.filter(([,p])=>Number(p)===0).map(([p])=>c(p)));return Q=Q.filter((p,h)=>!d.has(h)),r(200,{sections:await An(o.sections??[],t,n)})}let a;if(s==="/")return i(200,await R("index",t,n));if(a=s.match(/^\/products\/([\w-]+)$/)){let l=Fe(je(t,n).__currency).products[a[1]];if(!l)return i(404,await R("404",t,n));let c=n.searchParams.get("variant"),d={...l,selected_or_first_available_variant:l.variants.find(p=>String(p.id)===c)??l.variants[0]};return i(200,await R("product",t,n,{product:d,page_title:l.title}))}if(a=s.match(/^\/collections\/([\w-]+)(?:\/([\w-]+))?$/)){let l=Fe(je(t,n).__currency).collections[a[1]];if(!l)return i(404,await R("404",t,n));let c=a[2]?l.all_tags.find(p=>Hs.handleize(p)===a[2]):null,d=c?{...l,products:l.products.filter(p=>p.tags.includes(c))}:l;return i(200,await R("collection",t,n,{collection:d,current_tags:c?[c]:null,page_title:l.title}))}if(a=s.match(/^\/pages\/ingredient\/([\w-]+)$/)){let l=Fe(je(t,n).__currency).ingredients[a[1]];return l?i(200,await R("metaobject/ingredient",t,n,{metaobject:l,page_title:String(l.name)})):i(404,await R("404",t,n))}if((a=s.match(/^\/pages\/([\w-]+)$/))&&lt[a[1]]){let o=lt[a[1]];return i(200,await R(`page.${o.template_suffix}`,t,n,{page:o,page_title:o.title}))}return s==="/cart"?i(200,await R("cart",t,n)):i(404,await R("404",t,n))}catch(a){console.error(a),i(500,`<pre>${String(a.stack).replace(/</g,"&lt;")}</pre>`)}}).listen(jn,()=>console.log(`Racik preview \u2192 http://localhost:${jn}`));var le=new URL("./",self.location.href).pathname.replace(/\/$/,""),mo=/^\/(assets|img)\//,yo=/(["'(\s=,])\/(?!\/)(assets|img|products|collections|cart|search|recommendations|apps|pages|password|account|localization|contact|policies|checkout)\b/g,bo=t=>t.replace(yo,`$1${le}/$2`),_o=`<div style="position:fixed;left:12px;bottom:12px;z-index:2147483647;background:#111;color:#fff;font:600 12px/1.3 system-ui,sans-serif;padding:8px 12px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.25)">Live theme demo \xB7 rendered in your browser \xB7 <a href="${le}/../" style="color:#ffd27a">about</a></div>`,wo=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Checkout</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.6 system-ui,sans-serif;background:#f4f1ea;color:#1c1c1c;padding:24px;text-align:center">
<div style="max-width:520px"><h1 style="font-size:26px;margin:0 0 8px">This is where Shopify takes over</h1>
<p>Checkout is Shopify's own, hosted page; a theme doesn't render it. Everything up to here (product pages, the cart drawer, cart updates) ran through the theme in your browser.</p>
<p><a href="${le}/cart">Back to the bag</a> \xB7 <a href="${le}/../">About this project</a></p></div></body>`,Ws="preview-cart-log",Js=null;async function vo(){let e=await(await caches.open(Ws)).match("log");for(let n of e?await e.json():[])await Qs(n.method,n.path,n.type,n.body)}async function ko(t){let e=await caches.open(Ws),n=await e.match("log"),s=n?await n.json():[];s.push(t),await e.put("log",new Response(JSON.stringify(s)))}var Ys="preview-cookies";async function Gs(){let t=await(await caches.open(Ys)).match("jar");return t?await t.json():{}}async function xo(){let t=await Gs();if(self.cookieStore)for(let e of await self.cookieStore.getAll())t[e.name]=e.value;return Object.entries(t).map(([e,n])=>`${e}=${n}`).join("; ")}async function So(t){if(!t)return;let e=await Gs();for(let n of[].concat(t)){let[s]=String(n).split(";"),i=s.indexOf("=");e[s.slice(0,i).trim()]=s.slice(i+1).trim()}await(await caches.open(Ys)).put("jar",new Response(JSON.stringify(e)))}async function Qs(t,e,n,s,i={}){let r=s?[new TextEncoder().encode(s)]:[],a={method:t,url:e,headers:{"content-type":n||"",cookie:await xo(),...i},async*[Symbol.asyncIterator](){yield*r}};return new Promise(o=>{let l=200,c={};mt(a,{writeHead(p,h){l=p,c=h||{}},setHeader(p,h){c[p]=h},end(p){o({status:l,headers:c,content:p})}})})}self.addEventListener("install",()=>self.skipWaiting());self.addEventListener("activate",t=>t.waitUntil(self.clients.claim()));self.addEventListener("fetch",t=>{let e=new URL(t.request.url);if(e.origin!==self.location.origin||!e.pathname.startsWith(le))return;let n=e.pathname.slice(le.length)||"/";mo.test(n)||n==="/sw.js"||n==="/boot.html"||t.respondWith((async()=>{Js??=vo(),await Js;let s=t.request.method,i=t.request.headers.get("content-type")||"",r=s==="GET"?null:await t.request.text();if(n.startsWith("/checkout")||s==="POST"&&n==="/cart")return new Response(wo,{headers:{"Content-Type":"text/html; charset=utf-8"}});let a=n+e.search,o=await Qs(s,a,i,r,{referer:t.request.referrer||""});await So(o.headers["Set-Cookie"]||o.headers["set-cookie"]),s==="POST"&&/^\/cart\/(add|change|update)/.test(n)&&o.status<400&&await ko({method:s,path:a,type:i,body:r});let l=o.headers["Content-Type"]||o.headers["content-type"]||"text/html; charset=utf-8",c=o.content??"";/html|json/.test(l)&&typeof c=="string"&&(c=bo(c)),l.includes("html")&&t.request.mode==="navigate"&&(c=c.replace("</body>",`${_o}</body>`));let d=o.headers.Location||o.headers.location;return o.status>=300&&o.status<400&&d?Response.redirect(/^https?:/.test(d)?d:le+d,o.status):new Response(c,{status:o.status,headers:{"Content-Type":l}})})())});
