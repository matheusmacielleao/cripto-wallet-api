export interface Paginated<DocsModel> {
  docs: DocsModel[];
  offset: number;
  limit: number;
  total: number;
  skip: number;
}
