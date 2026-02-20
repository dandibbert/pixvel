export interface Novel {
  id: string
  title: string
  description: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  coverImage?: string
  tags: string[]
  pageCount: number
  textLength: number
  totalBookmarks: number
  totalViews: number
  createdAt: string
  updatedAt: string
  series?: {
    id: string
    title: string
  }
}

export interface NovelDetail extends Novel {
  content: string
  pages: NovelPage[]
  series?: {
    id: string
    title: string
  }
}

export interface NovelPage {
  page: number
  content: string
}

export interface NovelContent {
  novelId: string
  pages: NovelPage[]
  totalPages: number
}
