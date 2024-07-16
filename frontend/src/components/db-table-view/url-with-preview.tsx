import { cn, isImageUrl } from "@/lib/utils";
import { useSettingsStore } from "@/state";
import { memo } from "react";

const RawUrlWithPreview = ({ url }: { url: string }) => {
  const showImagesPreview = useSettingsStore.use.showImagesPreview();
  const isImage = showImagesPreview && isImageUrl(url);

  return (
    <a
      href={url}
      target={"_blank"}
      className={cn("hover:underline")}
      rel="noreferrer"
    >
      <div className={"flex items-center justify-between break-all gap-4"}>
        {url}
        {isImage && (
          <img src={url} alt={"preview"} className="size-20 object-cover" />
        )}
      </div>
    </a>
  );
};

export const UrlWithPreview = memo(RawUrlWithPreview);

UrlWithPreview.displayName = "UrlWithPreview";
