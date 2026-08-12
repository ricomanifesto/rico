export interface BreadcrumbItem {
  readonly name: string;
  readonly path: string;
}

export function breadcrumbStructuredData(items: readonly BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(index < items.length - 1
        ? { item: `https://ricomanifesto.com${item.path}` }
        : {}),
    })),
  };
}
