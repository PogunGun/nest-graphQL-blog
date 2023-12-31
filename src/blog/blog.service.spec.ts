import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { Repository } from 'typeorm';
import { BlogEntity } from './blog.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../users/user.service';
import { Roles, UserEntity } from '../users/user.entity';
import { CreateBlogInput } from './inputs/create-blog.input';
import {BlogPostEntity} from "../blog-post/blog-post.entity";
type MockType<T> = {
  [P in keyof T]?: jest.Mock<object>;
};
describe('BlogService', () => {
  let blogService: BlogService;
  let userService: UserService;

  const blogRepositoryMock: MockType<Repository<BlogEntity>> = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };
  const userRepositoryMock: MockType<Repository<UserEntity>> = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        UserService,
        {
          provide: getRepositoryToken(BlogEntity),
          useValue: blogRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();
    blogService = module.get<BlogService>(BlogService);
    userService = module.get<UserService>(UserService);
  });
  it('should be defined', () => {
    expect(blogService).toBeDefined();
    expect(userService).toBeDefined();
  });
  describe('create', () => {
    it('should create a new blog', async () => {
      const createBlogInput: CreateBlogInput = {
        name: 'Test Blog',
      };

      const user: UserEntity = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: Roles.Moderator,
      };

      const createdBlog: BlogEntity = {
        id: 1,
        name: 'Test Blog',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: user,
      };
      blogRepositoryMock.save.mockReturnValue(createdBlog);
      const newBlog = await blogService.create(createBlogInput, user);
      expect(newBlog).toMatchObject(createdBlog);
    });
  });
  describe('findAll', () => {
    it('should find all blogs', async () => {
      const blogs = [
        {
          name: 'any',
          id: 19,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'any',
          id: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      blogRepositoryMock.find.mockReturnValue(blogs);
      const foundCustomers = await blogService.findMany({
        title: '',
        take: 1,
        skip: 0,
      });

      const expectedCustomer = {
        name: 'any',
        id: 19,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      expect(foundCustomers).toContainEqual(expectedCustomer);
      expect(blogRepositoryMock.find).toHaveBeenCalled();
    });
  });
  describe('findOne', () => {
    it('should find a blog', async () => {
      const user: UserEntity = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: Roles.Moderator,
      };
      const blog: BlogEntity = {
        id: 1,
        name: 'Test Blog',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: user,
      };
      blogRepositoryMock.findOne.mockReturnValue(blog);
      const foundBlog = await blogService.findById(blog.id);
      expect(foundBlog).toMatchObject(blog);
      expect(blogRepositoryMock.findOne).toHaveBeenCalledWith({
        relations: ['user','blogPost'],
        where: { id: blog.id },
      });
    });
  });
});
