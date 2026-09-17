import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import { Image, View } from "react-native";

// 1. Types for our layout rows
type RowData =
  | { type: "full"; items: string[] }
  | { type: "triple"; items: string[] }
  | { type: "asymmetric"; items: string[] };

// 2. Helper component for images
const GalleryImage = ({
  sourceUri,
  className,
}: {
  sourceUri: string;
  className?: string;
}) => (
  <View className={`overflow-hidden bg-neutral-100 ${className}`}>
    <Image
      source={{ uri: sourceUri }}
      className="h-full w-full"
      resizeMode="cover"
    />
  </View>
);

// 3. Logic to chunk a flat array of images into the 4-step repeating pattern
const chunkImagesForGrid = (images: string[]): RowData[] => {
  const rows: RowData[] = [];
  let i = 0;

  while (i < images.length) {
    const step = rows.length % 4; // 4-step cycle: Full -> Triple -> Asymmetric -> Triple

    if (step === 0) {
      rows.push({ type: "full", items: images.slice(i, i + 1) });
      i += 1;
    } else if (step === 1 || step === 3) {
      rows.push({ type: "triple", items: images.slice(i, i + 3) });
      i += 3;
    } else if (step === 2) {
      rows.push({ type: "asymmetric", items: images.slice(i, i + 3) });
      i += 3;
    }
  }
  return rows;
};

// 4. Main Component
export default function GalleryLayout({
  images = Array.from({ length: 30 }).map(
    (_, i) => `https://picsum.photos/400/400?random=${i}`,
  ),
}: {
  images?: string[];
}) {
  // Memoize the chunked data so it doesn't recalculate on standard re-renders
  const rowData = useMemo(() => chunkImagesForGrid(images), [images]);

  const renderItem = ({ item }: { item: RowData }) => {
    // TYPE A: Single Full Width
    if (item.type === "full") {
      return (
        <View className="mb-4">
          <GalleryImage
            sourceUri={item.items[0]}
            className="w-full h-64 rounded-3xl"
          />
        </View>
      );
    }

    // TYPE B: Row of 3 Squares
    if (item.type === "triple") {
      return (
        <View className="flex-row w-full gap-4 mb-4">
          {item.items.map((src, idx) => (
            <GalleryImage
              key={idx}
              sourceUri={src}
              className="flex-1 aspect-square rounded-2xl"
            />
          ))}
          {/* Fill empty spaces if the array ends early */}
          {Array.from({ length: 3 - item.items.length }).map((_, idx) => (
            <View key={`empty-triple-${idx}`} className="flex-1" />
          ))}
        </View>
      );
    }

    // TYPE C: Asymmetric (2/3 Left, 1/3 Stacked Right)
    if (item.type === "asymmetric") {
      const [leftImg, rightImgTop, rightImgBottom] = item.items;
      return (
        <View className="flex-row w-full h-[400px] gap-4 mb-4">
          {leftImg ? (
            <GalleryImage
              sourceUri={leftImg}
              className="flex-[2] rounded-3xl"
            />
          ) : (
            <View className="flex-[2]" />
          )}

          <View className="flex-[1] flex-col gap-4">
            {rightImgTop ? (
              <GalleryImage
                sourceUri={rightImgTop}
                className="flex-1 rounded-2xl"
              />
            ) : (
              <View className="flex-1" />
            )}
            {rightImgBottom ? (
              <GalleryImage
                sourceUri={rightImgBottom}
                className="flex-1 rounded-2xl"
              />
            ) : (
              <View className="flex-1" />
            )}
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={rowData}
        renderItem={renderItem}
        // Critical for performance: Tells FlashList which layout template to recycle
        getItemType={(item) => item.type}
        // estimatedItemSize={250}

        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
