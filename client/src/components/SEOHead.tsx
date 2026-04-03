import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  price?: string;
  currency?: string;
  availability?: "in stock" | "out of stock";
  brand?: string;
  noindex?: boolean;
}

const SITE_NAME = "4 YOU Store";
const DEFAULT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030522584/MmHspuuRpmJpFJcsenBoBv/pwa-icon-512-LQHzFZFXKAMp7JGXV2Dtjg.png";
const BASE_URL = "https://4you-stores.com";

export default function SEOHead({
  title,
  description = "متجر 4 YOU للعطور الفاخرة والمكياج والعناية بالبشرة من أرقى الماركات العالمية. شحن مجاني للطلبات فوق 250 ريال.",
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  price,
  currency = "SAR",
  availability,
  brand,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - متجر العطور والمكياج الفاخر`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type === "product" ? "product" : "website"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_SA" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Product-specific meta */}
      {type === "product" && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
          {availability && <meta property="product:availability" content={availability} />}
          {brand && <meta property="product:brand" content={brand} />}
        </>
      )}

      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}

/**
 * Product JSON-LD structured data component
 */
export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = "SAR",
  availability,
  brand,
  sku,
  url,
  rating,
  reviewCount,
}: {
  name: string;
  description?: string;
  image?: string;
  price: string;
  currency?: string;
  availability: "InStock" | "OutOfStock";
  brand?: string;
  sku?: string;
  url: string;
  rating?: number;
  reviewCount?: number;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || name,
    image: image || DEFAULT_IMAGE,
    sku: sku || undefined,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}${url}`,
      priceCurrency: currency,
      price,
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    ...(rating && reviewCount && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.toFixed(1),
            reviewCount,
          },
        }
      : {}),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
