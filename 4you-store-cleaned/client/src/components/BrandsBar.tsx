import { Link } from "wouter";
import { useMemo } from "react";

const brands = [
  { name: "Ibrahim Al Qurashi", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030522584/MmHspuuRpmJpFJcsenBoBv/ibraq-logo_39fb857b.png" },
  { name: "Assaf", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030522584/MmHspuuRpmJpFJcsenBoBv/assaf-logo_96b3610a.png" },
  { name: "Laverne", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030522584/MmHspuuRpmJpFJcsenBoBv/laverne-logo_d698c633.jpg" },
  { name: "Dkhoon AlEmiratia", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030522584/MmHspuuRpmJpFJcsenBoBv/dkhoon-logo_e2ba4060.jpg" },
  { name: "Jean Paul Gaultier", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030522584/MmHspuuRpmJpFJcsenBoBv/jpgaultier-logo_4bdaa7b2.jpg" },
  { name: "Sephora", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/sephora_764a8ac0.png" },
  { name: "KIKO Milano", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/kiko_10e72a4f.png" },
  { name: "Chanel", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/chanel_59bad46d.png" },
  { name: "NARS", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/nars_674cc805.png" },
  { name: "SHEGLAM", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/sheglam_c10fbc76.png" },
  { name: "Dior", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/dior_328fb04c.webp" },
  { name: "MAC", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/mac_398eb1e9.webp" },
  { name: "Flormar", logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/flormar_349c3245.webp" },
];

export default function BrandsBar() {
  const duplicatedBrands = useMemo(() => [...brands, ...brands, ...brands], []);
  return (
    <div className="sticky top-[84px] md:top-[92px] z-40 overflow-hidden bg-white border-b border-black/[0.04]">
      <div className="relative py-2.5">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="flex brands-scroll" style={{ width: "max-content" }}>
          {duplicatedBrands.map((brand, i) => (
            <Link
              key={`${brand.name}-${i}`}
              href={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="flex-shrink-0 mx-3 md:mx-4 group"
            >
              <div className="h-[32px] md:h-[36px] flex items-center justify-center px-2">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-[22px] md:max-h-[26px] max-w-[80px] md:max-w-[90px] object-contain opacity-25 group-hover:opacity-70 transition-opacity duration-500"
                  style={{ filter: "grayscale(100%)" }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
