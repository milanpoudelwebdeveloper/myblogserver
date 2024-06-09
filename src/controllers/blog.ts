/* eslint-disable quotes */
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import db from '@root/db'
import { s3 } from '@utils/imageUpload'
import { Request, Response } from 'express'
import slugify from 'slugify'

const bucketName = process.env.BUCKET_NAME!

export const addBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, categories, published, featured, writtenBy, tableOfContents } = req.body
    const coverImage = req.file
    if (!title || !content || !coverImage || !categories.length || !writtenBy) {
      return res.status(400).json({ message: 'Please fill all the fields' })
    }
    const metaTitle = slugify(title, { lower: true, remove: /[*+~.()'"!:@]/g })
    const uploadParams = {
      Bucket: bucketName,
      Key: req?.file?.originalname + '-' + Date.now(),
      Body: req?.file?.buffer,
      ContentType: req?.file?.mimetype
    }
    await s3.send(new PutObjectCommand(uploadParams))

    const query =
      'INSERT INTO blog (title, metaTitle, content, coverImage, published, featured, writtenBy, tableOfContents) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
    const blog = await db.query(query, [title, metaTitle, content, uploadParams.Key, published, featured, writtenBy, tableOfContents])
    if (blog.rows.length > 0) {
      for (const category of categories) {
        await db.query('INSERT INTO blogcategories (blogid, categoryid) VALUES ($1, $2)', [blog.rows[0].id, category])
      }
      const message = published ? 'Blog published successfully' : 'Blog saved as draft successfully'
      return res.status(201).json({ message: message })
    } else {
      return res.status(500).json({ message: 'Something went wrong while performing an action.Please try again' })
    }
  } catch (e) {
    console.log('hey error while adding blog', e)
    return res.status(500).json({ message: 'Something went wrong while performing an action.Please try again' })
  }
}

export const getBlogs = async (req: Request, res: Response) => {
  const { categoryId, limit, currentPage, fetchAll } = req.query

  const finalLimit = limit ? parseInt(limit as string) : 6
  const finalPage = currentPage ? parseInt(currentPage as string) : 1
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let blogs: any = []
    if (fetchAll) {
      blogs = await db.query(`SELECT blog.id, blog.title, blog.metatitle, blog.createdat FROM blog ORDER BY blog.createdat DESC`, [])
    } else if (categoryId === 'all') {
      blogs = await db.query(
        `SELECT blog.*, count(*) OVER() AS full_count, users.name, users.profileimage, ARRAY_AGG(json_build_object('label', category.name, 'value', category.id)) AS categories FROM blog LEFT JOIN blogcategories ON blog.id=blogcategories.blogid LEFT JOIN category ON blogcategories.categoryid=category.id LEFT JOIN users ON blog.writtenby=users.id  GROUP BY blog.id, users.id ORDER BY blog.createdat DESC
        LIMIT ${finalLimit} OFFSET (${finalPage} - 1) * ${finalLimit}`,
        []
      )
    } else {
      blogs = await db.query(
        `SELECT blog.*, count(*) OVER() AS full_count, users.name, users.profileimage, ARRAY_AGG(json_build_object('label', category.name, 'value', category.id)) AS categories FROM blog LEFT JOIN blogcategories ON blog.id=blogcategories.blogid LEFT JOIN category ON blogcategories.categoryid=category.id LEFT JOIN users ON blog.writtenby=users.id WHERE category.id=$1 GROUP BY blog.id, users.id ORDER BY blog.createdat DESC
        LIMIT ${finalLimit} OFFSET (${finalPage} - 1) * ${finalLimit}`,
        [categoryId as string]
      )
    }
    const totalBlogsCount = blogs.rows[0].full_count
    const totalPages = Math.ceil(totalBlogsCount / finalLimit)

    if (blogs.rows.length > 0) {
      for (const blog of blogs.rows) {
        blog.coverimage = process.env.CDN_URL + blog.coverimage
      }

      return res.status(200).json({
        message: 'Blogs fetched successfully',
        data: blogs.rows,
        totalPages: totalPages
      })
    } else {
      return res.status(201).json({ message: 'No blogs found', data: [] })
    }
  } catch (e) {
    console.log('hey error while getting blogs', e)
    return res.status(500).json({ message: 'Something went wrong while getting blogs. Please try again' })
  }
}

export const getFeaturedBlog = async (_: Request, res: Response) => {
  try {
    const featuredBlog = await db.query(
      `SELECT blog.*, users.name, users.profileimage, ARRAY_AGG(json_build_object('label', category.name, 'value', category.id)) AS categories FROM blog  LEFT JOIN blogcategories ON blog.id=blogcategories.blogid LEFT JOIN category ON blogcategories.categoryid=category.id LEFT JOIN users ON blog.writtenby=users.id WHERE featured=true GROUP BY blog.id, users.id ORDER BY blog.createdat DESC LIMIT 1`,
      []
    )
    if (featuredBlog.rows.length > 0) {
      const foundBlog = featuredBlog.rows[0]
      foundBlog.coverimage = process.env.CDN_URL + foundBlog.coverimage
      return res.status(200).json({
        message: 'Featured Blog fetched successfully',
        data: foundBlog
      })
    } else {
      return res.status(200).json({ message: 'No featured blog found', data: null })
    }
  } catch (e) {
    console.log('hey error while getting featured blog', e)
    return res.status(500).json({ message: 'Something went wrong while getting featured blog. Please try again' })
  }
}

export const getBlogDetails = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const blogDetails = await db.query(
      'SELECT blog.*, users.name, users.profileimage FROM blog LEFT JOIN users ON blog.writtenby=users.id WHERE blog.id=$1 GROUP BY blog.id,users.id',
      [id]
    )

    if (blogDetails?.rows?.length) {
      const findRelatedCategories = await db.query(
        `SELECT ARRAY_AGG(json_build_object('label', category.name, 'value', category.id)) AS categories FROM blogcategories LEFT JOIN category ON blogcategories.categoryid=category.id WHERE blogcategories.blogid=$1 GROUP BY blogcategories.blogid`,
        [id]
      )
      const foundBlog = blogDetails?.rows[0]
      foundBlog.coverimage = process.env.CDN_URL + foundBlog.coverimage
      const categories = findRelatedCategories?.rows[0]
      const formattedCategories = categories['categories']
      return res.status(201).json({
        message: 'Blog Details fetched successfully',
        data: { ...foundBlog, categories: formattedCategories }
      })
    } else {
      return res.status(404).json({ message: 'No blog details found' })
    }
  } catch (e) {
    console.log('hey error while getting blog details', e)
    return res.status(500).json({ message: 'Something went wrong while getting blog details. Please try again' })
  }
}

export const updateBlog = async (req: Request, res: Response) => {
  const { title, content, published, categories, tableofcontents } = req.body
  const { id } = req.params
  const metaTitle = slugify(title, { lower: true, remove: /[*+~.()'"!:@]/g })

  let finalFile
  const image = req.file

  if (image) {
    const uploadParams = {
      Bucket: bucketName,
      Key: image?.originalname + '-' + Date.now(),
      Body: image?.buffer,
      ContentType: image?.mimetype
    }
    await s3.send(new PutObjectCommand(uploadParams))
    finalFile = uploadParams.Key
  }

  try {
    const findBlog = await db.query('SELECT DISTINCT * FROM blog WHERE id=$1', [id])
    console.log('in controller, table of conents is', tableofcontents)
    if (findBlog.rows.length > 0) {
      const query =
        'UPDATE blog SET title=$1, content=$2, coverimage = COALESCE($3, coverimage), published=$4, metaTitle=$5, toc=$6 WHERE id=$7 RETURNING *'
      await db.query(query, [title, content, finalFile, published, metaTitle, tableofcontents, id])
      await db.query('DELETE FROM blogcategories WHERE blogid=$1', [id])
      for (const category of categories) {
        await db.query('INSERT INTO blogcategories (blogid, categoryid) VALUES ($1, $2)', [id, category])
      }
      return res.status(201).json({ message: 'Blog updated successfully' })
    } else {
      return res.status(404).json({ message: 'No blog found' })
    }
  } catch (e) {
    console.log('hey error while updating the blog', e)
    return res.status(500).json({ message: 'Something went wrong while updating the blog. Please try again' })
  }
}

export const deleteBlog = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const findBlog = await db.query('SELECT DISTINCT * FROM blog WHERE id=$1', [id])
    if (findBlog.rows.length > 0) {
      const foundBlog = findBlog.rows[0]
      const query = 'DELETE FROM blog WHERE id=$1'
      await db.query(query, [id])
      const deleteParams = {
        Bucket: bucketName,
        Key: foundBlog.coverimage
      }
      await s3.send(new DeleteObjectCommand(deleteParams))
      return res.status(201).json({ message: 'Blog deleted successfully' })
    } else {
      return res.status(404).json({ message: 'No blog found' })
    }
  } catch (e) {
    console.log('hey error while deleting blog', e)
    return res.status(500).json({ message: 'Something went wrong while deleting blog. Please try again' })
  }
}

export const updateBlogReadCount = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const findBlog = await db.query('SELECT DISTINCT * FROM blog WHERE id=$1', [id])
    if (findBlog.rows.length > 0) {
      const foundBlog = findBlog.rows[0]
      const query = 'UPDATE blog SET readcount=$1 WHERE id=$2 RETURNING *'
      await db.query(query, [foundBlog?.readcount + 1, id])
      return res.status(201).json({ message: 'Blog read count updated successfully' })
    } else {
      return res.status(404).json({ message: 'No blog found' })
    }
  } catch (e) {
    console.log('hey error while updating blog read count', e)
    return res.status(500).json({ message: 'Something went wrong while updating blog read count. Please try again' })
  }
}

export const getPopularBlogs = async (_: Request, res: Response) => {
  try {
    const popularBlogs = await db.query('SELECT * FROM blog ORDER BY readcount DESC LIMIT 4', [])
    if (popularBlogs.rows.length > 0) {
      for (const blog of popularBlogs.rows) {
        blog.coverimage = process.env.CDN_URL + blog.coverimage
      }
      return res.status(200).json({
        message: 'Popular Blogs fetched successfully',
        data: popularBlogs.rows
      })
    } else {
      return res.status(404).json({ message: 'No popular blogs found' })
    }
  } catch (e) {
    console.log('hey error while getting popular blogs', e)
    return res.status(500).json({ message: 'Something went wrong while getting popular blogs. Please try again' })
  }
}

export const savePost = async (req: Request, res: Response) => {
  const blogId = req.params.id
  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ message: 'Please login to save the post' })
  }
  try {
    const query = 'INSERT INTO savedblog (userid, blogid) VALUES ($1, $2)'
    await db.query(query, [userId, blogId])
    return res.status(201).json({ message: 'Post saved successfully' })
  } catch (e) {
    console.log('hey error while saving post', e)
    return res.status(500).json({ message: 'Something went wrong while saving post. Please try again' })
  }
}

export const unSavePost = async (req: Request, res: Response) => {
  const blogId = req.params.id
  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ message: 'Please login to unsave the post' })
  }
  try {
    const query = 'DELETE FROM savedblog WHERE userid=$1 AND blogid=$2'
    await db.query(query, [userId, blogId])
    return res.status(201).json({ message: 'Post unsaved successfully' })
  } catch (e) {
    console.log('hey error while unsaving post', e)
    return res.status(500).json({ message: 'Something went wrong while unsaving post. Please try again' })
  }
}

export const getSavedPosts = async (req: Request, res: Response) => {
  const userId = req.params.id
  if (!userId) {
    return res.status(400).json({ message: 'Please login to view saved posts' })
  }
  try {
    const query = `SELECT savedblog.*, blog.*, users.name, users.profileimage, ARRAY_AGG(json_build_object('label', category.name, 'value', category.id)) AS categories FROM savedblog LEFT JOIN blog ON savedblog.blogid=blog.id LEFT JOIN blogcategories ON blog.id=blogcategories.blogid LEFT JOIN category ON blogcategories.categoryid=category.id LEFT JOIN users ON blog.writtenby=users.id WHERE savedblog.userid=$1 GROUP BY savedblog.id, blog.id, users.id ORDER BY savedblog.createdat DESC`
    const savedPosts = await db.query(query, [userId])
    if (savedPosts.rows.length > 0) {
      for (const post of savedPosts.rows) {
        post.coverimage = process.env.CDN_URL + post.coverimage
      }
      return res.status(200).json({
        message: 'Saved Posts fetched successfully',
        data: savedPosts.rows
      })
    } else {
      return res.status(200).json({ message: 'No saved posts found', data: null })
    }
  } catch (e) {
    console.log('hey error while getting saved posts', e)
    return res.status(500).json({ message: 'Something went wrong while getting saved posts. Please try again' })
  }
}

export const getBlogsByUser = async (req: Request, res: Response) => {
  const { categoryId } = req.query
  const userId = req.params.id
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let blogs: any = []
    if (categoryId === 'all') {
      blogs = await db.query(
        `SELECT blog.*, users.name, users.profileimage, ARRAY_AGG(json_build_object('label', category.name, 'value', category.id)) AS categories FROM blog LEFT JOIN blogcategories ON blog.id=blogcategories.blogid LEFT JOIN category ON blogcategories.categoryid=category.id LEFT JOIN users ON blog.writtenby=users.id WHERE blog.writtenby=$1 GROUP BY blog.id, users.id ORDER BY blog.createdat DESC`,
        [userId]
      )
    } else {
      blogs = await db.query(
        `SELECT blog.*, users.name, users.profileimage, ARRAY_AGG(json_build_object('label', category.name, 'value', category.id)) AS categories FROM blog LEFT JOIN blogcategories ON blog.id=blogcategories.blogid LEFT JOIN category ON blogcategories.categoryid=category.id LEFT JOIN users ON blog.writtenby=users.id WHERE category.id=$1 AND blog.writtenby=$2 GROUP BY blog.id, users.id ORDER BY blog.createdat DESC`,
        [categoryId as string, userId]
      )
    }
    if (blogs.rows.length > 0) {
      for (const blog of blogs.rows) {
        blog.coverimage = process.env.CDN_URL + blog.coverimage
      }
      return res.status(200).json({
        message: 'Blogs fetched successfully',
        data: blogs.rows
      })
    } else {
      return res.status(201).json({ message: 'No blogs found', data: [] })
    }
  } catch (e) {
    console.log('hey error while getting blogs', e)
    return res.status(500).json({ message: 'Something went wrong while getting blogs. Please try again' })
  }
}

export const uploadImage = async (req: Request, res: Response) => {
  const file = req.file
  try {
    const uploadParams = {
      Bucket: bucketName,
      Key: file?.originalname + '-' + Date.now(),
      Body: file?.buffer,
      ContentType: file?.mimetype
    }
    await s3.send(new PutObjectCommand(uploadParams))
    return res.status(201).json({ message: 'Image uploaded successfully', imageUrl: process.env.CDN_URL + uploadParams.Key })
  } catch (error) {
    console.log('hey error while uploading image', error)
    return res.status(500).json({ message: 'Something went wrong while uploading image. Please try again' })
  }
}

export const isBlogLiked = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req?.user?.id
  if (!userId) {
    return res.status(400).json({ message: 'Please login to check' })
  }
  try {
    const query = 'SELECT * FROM savedblog sb WHERE sb.blogid=$1 AND sb.userid=$2'
    const likedBlog = await db.query(query, [id, userId])
    console.log('likedBlog', likedBlog)
    if (likedBlog.rows.length > 0) {
      return res.status(200).json({ message: 'Blog is liked', data: true })
    } else {
      return res.status(200).json({ message: 'Blog is not liked', data: false })
    }
  } catch (e) {
    console.log('hey error while checking blog liked', e)
    return res.status(500).json({ message: 'Something went wrong while checking blog liked. Please try again' })
  }
}
