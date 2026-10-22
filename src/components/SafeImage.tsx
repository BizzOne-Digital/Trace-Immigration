"use client";

import Image, { type ImageProps } from "next/image";
import { resolveImageUrl } from "@/lib/image-assets";
import { useState } from "react";
import { ImageOff } from "lucide-react";

type Props = Omit<ImageProps, "src"> & { src?: string | null; fallbackLabel?: string };

/** Legacy local-disk URLs never exist in production; render a placeholder instead of requesting them. */
function isRenderable(src?: string | null): src is string {
  if (!src) return false;
  if (src.startsWith("/uploads/")) return false;
  return src.startsWith("/") || src.startsWith("https://images.unsplash.com/");
}

/**
 * next/image with a graceful, loop-free fallback: on error we switch to a static
 * placeholder element (not another image URL), so a failure can never retrigger itself.
 */
export default function SafeImage({ src: source, alt, fallbackLabel, className, fill, width, height, ...rest }: Props) {
  const src = resolveImageUrl(source);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !isRenderable(src) || failedSrc === src;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackLabel || "Image unavailable"}
        className={`flex items-center justify-center bg-cream text-gold ${fill ? "absolute inset-0" : ""} ${className ?? ""}`}
        style={fill ? undefined : { width: Number(width) || undefined, height: Number(height) || undefined }}
      >
        <ImageOff aria-hidden className="h-8 w-8 opacity-60" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      onError={() => setFailedSrc(src)}
      {...rest}
    />
  );
}
