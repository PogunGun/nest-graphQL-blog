import { Test, TestingModule } from '@nestjs/testing';
import { BlogResolver } from './blog.resolver';
import { BlogService } from './blog.service';
import { BlogEntity } from './blog.entity';
import { UserService } from '../users/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {Roles, UserEntity} from '../users/user.entity';
import { Repository } from 'typeorm';
import { BlogPostService } from '../blog-post/blog-post.service';
import { BlogPostEntity } from '../blog-post/blog-post.entity';
import {ForbiddenException} from "@nestjs/common";
type MockType<T> = {
  [P in keyof T]?: jest.Mock<object>;
};
describe('BlogResolver', () => {
  let blogResolver: BlogResolver;
  let blogService: BlogService;
  const customerRepositoryMockUser: MockType<Repository<UserEntity>> = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const customerRepositoryMockBlogPost: MockType<Repository<BlogPostEntity>> = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogResolver,
        UserService,
        BlogPostService,
        {
          provide: BlogService,
          useValue: {
            updateById: jest.fn(),
            removeById: jest.fn(),
            isCreatorOrModerator: jest.fn(),
            findById: jest.fn(),
            findMany: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: customerRepositoryMockUser,
        },
        {
          provide: getRepositoryToken(BlogPostEntity),
          useValue: customerRepositoryMockBlogPost,
        },
      ],
    }).compile();

    blogResolver = module.get<BlogResolver>(BlogResolver);
    blogService = module.get<BlogService>(BlogService);
  });

  describe('updateBlog', () => {
    it('should update a blog and return the updated blog', async () => {
      // Arrange
      const updateUserInput = {
        id: 1,
        name: 'Blog1',
      };

      const updatedBlog = new BlogEntity();
      updatedBlog.id = 1;
      updatedBlog.name = 'Blog1';

      jest.spyOn(blogService, 'updateById').mockResolvedValue(updatedBlog);
      jest.spyOn(blogService, 'isCreatorOrModerator').mockResolvedValue(true);

      const user2 = new UserEntity();
      user2.id = 2;
      user2.firstName = 'Jane';
      user2.lastName = 'Smith';
      user2.email = 'jane.smith@example.com';
      user2.role = Roles.Moderator;

      // Act
      const result = await blogResolver.updateBlog(updateUserInput, user2);

      // Assert
      expect(blogService.updateById).toHaveBeenCalledWith(updateUserInput);
      expect(result).toBe(updatedBlog);
    });
    it('should update a blog and return the updated blog', async () => {
      // Arrange
      const updateUserInput = {
        id: 1,
        name: 'Blog1',
      };

      const updatedBlog = new BlogEntity();
      updatedBlog.id = 1;
      updatedBlog.name = 'Blog1';

      jest.spyOn(blogService, 'updateById').mockResolvedValue(updatedBlog);
      jest.spyOn(blogService, 'isCreatorOrModerator').mockResolvedValue(true);

      const user2 = new UserEntity();
      user2.id = 2;
      user2.firstName = 'Jane';
      user2.lastName = 'Smith';
      user2.email = 'jane.smith@example.com';
      user2.role = Roles.Moderator;

      // Act
      const result = await blogResolver.updateBlog(updateUserInput, user2);

      // Assert
      expect(blogService.updateById).toHaveBeenCalledWith(updateUserInput);
      expect(result).toBe(updatedBlog);
    });

    it('should update a blog and return the updated blog', async () => {
      // Arrange
      const updateUserInput = {
        id: 1,
        name: 'Blog1',
      };

      const updatedBlog = new BlogEntity();
      updatedBlog.id = 1;
      updatedBlog.name = 'Blog1';

      jest.spyOn(blogService, 'updateById').mockResolvedValue(updatedBlog);
      jest.spyOn(blogService, 'isCreatorOrModerator').mockResolvedValue(true);

      const user2 = new UserEntity();
      user2.id = 2;
      user2.firstName = 'Jane';
      user2.lastName = 'Smith';
      user2.email = 'jane.smith@example.com';
      user2.role = Roles.Moderator;

      // Act
      const result = await blogResolver.updateBlog(updateUserInput, user2);

      // Assert
      expect(blogService.updateById).toHaveBeenCalledWith(updateUserInput);
      expect(result).toBe(updatedBlog);
    });

    it('should throw ForbiddenException (User is not creator or moderator)', async () => {
      // Arrange
      const updateUserInput = {
        id: 1,
        name: 'Blog1',
      };

      jest.spyOn(blogService, 'updateById').mockResolvedValue(new BlogEntity());
      jest.spyOn(blogService, 'isCreatorOrModerator').mockResolvedValue(false);

      const user2 = new UserEntity();
      user2.id = 2;
      user2.firstName = 'Jane';
      user2.lastName = 'Smith';
      user2.email = 'jane.smith@example.com';
      user2.role = Roles.Writer;

      // Act & Assert
      await expect(blogResolver.updateBlog(updateUserInput, user2)).rejects.toThrowError(
          ForbiddenException,
      );
    });
  });

  describe('removeBlog', () => {
    it('should remove a blog and return the number of affected rows', async () => {
      // Arrange
      const id = 1; // Provide the necessary input for testing
      const affectedRows = 1; // Provide the expected number of affected rows

      jest.spyOn(blogService, 'removeById').mockResolvedValue(affectedRows);
      jest.spyOn(blogService, 'isCreatorOrModerator').mockResolvedValue(true);

      const user2 = new UserEntity();
      user2.id = 2;
      user2.firstName = 'Jane';
      user2.lastName = 'Smith';
      user2.email = 'jane.smith@example.com';
      user2.role = Roles.Moderator;

      // Act
      const result = await blogResolver.removeBlog(id, user2);

      // Assert
      expect(blogService.removeById).toHaveBeenCalledWith(id);
      expect(result).toBe(affectedRows);
    });

    it('should throw ForbiddenException (User is not creator or moderator)', async () => {
      // Arrange
      const id = 1; // Provide the necessary input for testing
      const user2 = new UserEntity();
      user2.id = 2;
      user2.firstName = 'Jane';
      user2.lastName = 'Smith';
      user2.email = 'jane.smith@example.com';
      user2.role = Roles.Writer;

      // Act & Assert
      await expect(blogResolver.removeBlog(id, user2)).rejects.toThrowError(
          ForbiddenException,
      );
    });
  });

  describe('getOneBlog', () => {
    it('should retrieve a blog by ID and return the user', async () => {
      // Arrange

      // User
      const user2 = new UserEntity();
      user2.id = 2;
      user2.firstName = 'Jane';
      user2.lastName = 'Smith';
      user2.email = 'jane.smith@example.com';
      user2.role = Roles.Moderator;
      const id = 1; // Provide the necessary input for testing

      // BLOG

      const blog = new BlogEntity();
      blog.id = 1;
      blog.name = 'Blog1';
      blog.user=user2
      jest.spyOn(blogService, 'findById').mockResolvedValue(blog);

      // Act
      const result = await blogResolver.getOneUser(id);

      // Assert
      expect(blogService.findById).toHaveBeenCalledWith(id);
      expect(result).toBe(blog);
    });
  });

  describe('getAllUsers', () => {
    it('should retrieve all blogs and return an array of blogs', async () => {
      // Arrange
      const blog1 = new BlogEntity();
      blog1.id = 1;
      blog1.name = 'Blog1';

      const blog2 = new BlogEntity();
      blog2.id = 2;
      blog1.name = 'Blog2';

      const expectedUsers = [blog1, blog2];

      jest.spyOn(blogService, 'findMany').mockResolvedValue(expectedUsers);

      // Act
      const result = await blogResolver.getAllBlogs({
        take: 2,
        skip: 0,
        title: '',
      });

      // Assert
      expect(blogService.findMany).toHaveBeenCalled();
      expect(result).toBe(expectedUsers);
    });
  });
});
