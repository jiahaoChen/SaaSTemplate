import type { TagType } from './data';

export async function queryTags(): Promise<{ data: { list: TagType[] } }> {
  return {
    data: {
      list: [
        { name: "tag1", value: 100, type: "0" },
        { name: "tag2", value: 75, type: "1" },
        { name: "tag3", value: 50, type: "2" },
        { name: "tag4", value: 120, type: "0" },
        { name: "tag5", value: 80, type: "1" },
      ],
    },
  };
}
