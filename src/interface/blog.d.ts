interface IBlog {
  id: number | string
  title: string
  content: string
  coverimage: string
  category: number
  createdat: string
  categoryname: string
}

interface ICategory {
  id: number | string
  name: string
  image: string
  createdat: string
}
