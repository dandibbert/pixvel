interface DocumentTitleTarget {
  title: string
}

export function setDocumentTitle(title: string, target: DocumentTitleTarget = document) {
  target.title = title
}
