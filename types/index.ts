
export type Channel = {
  id: string;
  name: string;
  alt_names?: string[];
  network?: string;
  owners?: string[];
  country: string;
  subdivision?: string;
  city?: string;
  broadcast_area?: string[];
  languages: string[];
  categories: string[];
  is_nsfw: boolean;
  launched?: string;
  closed?: string;
  replaced_by?: string;
  website?: string;
  logo?: string;
};

export type Stream = {
  channel: string;
  url: string;
  timeshift?: string;
  http_referrer?: string;
  user_agent?: string;
};

export type Guide = {
  channel: string;
  site: string;
  site_id: string;
  site_name: string;
  lang: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Language = {
  name: string;
  code: string;
};

export type Country = {
  name: string;
  code: string;
  languages: string[];
  flag: string;
};

export type Subdivision = {
  country: string;
  name: string;
  code: string;
};

export type Region = {
  code: string;
  name: string;
  countries: string[];
};

export type BlocklistItem = {
  channel: string;
  ref: string;
};

export type TV = {
  channels: Channel[];
  streams: Stream[];
  guides: Guide[];
  categories: Category[];
  languages: Language[];
  countries: Country[];
  subdivisions: Subdivision[];
  regions: Region[];
  blocklist: BlocklistItem[];
};