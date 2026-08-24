import Image from "next/image";

type LogoProps = {
  size?: "header" | "footer";
  className?: string;
};

export function Logo({ size = "header", className }: LogoProps) {
  const isFooter = size === "footer";

  return (
    <div className={className}>
      <Image
        src={isFooter ? "/images/brand/logo-bc-footer.svg" : "/images/brand/logo-bc.jpg"}
        alt="Beauty and Co"
        width={isFooter ? 497 : 1200}
        height={isFooter ? 230 : 1197}
        className="h-full w-full object-contain"
        priority={!isFooter}
        loading={isFooter ? "eager" : undefined}
        unoptimized={isFooter}
      />
    </div>
  );
}
