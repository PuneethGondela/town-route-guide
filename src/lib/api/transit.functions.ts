import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { CITIES, type NearbyCategory } from "../transit-data";

const CATEGORY_FILTERS: Record<NearbyCategory, { tags: string[]; description: string }> = {
  tourist: {
    tags: ["tourism=attraction", "tourism=viewpoint", "tourism=museum", "tourism=garden", "tourism=zoo", "tourism=gallery"],
    description: "Tourist attractions",
  },
  food: {
    tags: ["amenity=restaurant", "amenity=cafe", "amenity=fast_food", "amenity=ice_cream", "amenity=bar"],
    description: "Food and dining",
  },
  medical: {
    tags: ["amenity=hospital", "amenity=clinic", "amenity=doctors", "amenity=pharmacy", "healthcare=doctors"],
    description: "Medical services",
  },
  atm: {
    tags: ["amenity=atm"],
    description: "ATMs",
  },
  temples: {
    tags: ["amenity=place_of_worship[religion=hindu]", "religion=hindu"],
    description: "Hindu temples",
  },
  events: {
    tags: ["amenity=theatre", "amenity=community_centre", "amenity=cinema", "amenity=arts_centre"],
    description: "Event venues",
  },
};

const buildOverpassQuery = (lat: number, lon: number, category: NearbyCategory) => {
  const filter = CATEGORY_FILTERS[category];
  const radius = 2500;
  const clause = filter.tags
    .map((tag) => {
      if (tag.includes("[")) {
        return `node(around:${radius},${lat},${lon})[${tag}];way(around:${radius},${lat},${lon})[${tag}];relation(around:${radius},${lat},${lon})[${tag}];`;
      }
      return `node(around:${radius},${lat},${lon})[${tag}];way(around:${radius},${lat},${lon})[${tag}];relation(around:${radius},${lat},${lon})[${tag}];`;
    })
    .join("\n");
  return `
[out:json][timeout:25];
(
${clause}
);
out center 20;
`;
};

const sortByDistance = <T extends { lat: number; lon: number }>(
  items: T[],
  origin: { lat: number; lon: number }
) => {
  return items
    .map((item) => {
      const dy = item.lat - origin.lat;
      const dx = item.lon - origin.lon;
      return { ...item, distance: Math.hypot(dx, dy) };
    })
    .sort((a, b) => a.distance - b.distance);
};

export const getNearbyPlaces = createServerFn({ method: "POST" })
  .inputValidator(z.object({ cityId: z.string(), category: z.enum(["tourist", "food", "medical", "atm", "temples", "events"]) }))
  .handler(async ({ data }) => {
    const city = CITIES.find((city) => city.id === data.cityId);
    if (!city) {
      throw new Error("City not found");
    }

    const query = buildOverpassQuery(city.lat, city.lon, data.category as NearbyCategory);
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: query }).toString(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch nearby places");
    }
    const payload = await response.json();
    const elements = payload.elements ?? [];

    const rawPlaces = elements
      .map((element: any) => {
        const name = element.tags?.name ?? element.tags?.operator ?? "Unnamed place";
        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;
        return name && lat != null && lon != null ? { name, lat: Number(lat), lon: Number(lon), type: element.tags?.amenity ?? element.tags?.tourism ?? "unknown" } : null;
      })
      .filter(Boolean) as Array<{ name: string; lat: number; lon: number; type: string }>;

    const sorted = sortByDistance(rawPlaces, { lat: city.lat, lon: city.lon }).slice(0, 6);

    return sorted.map((place) => ({
      name: place.name,
      type: place.type,
    }));
  });
