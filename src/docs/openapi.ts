export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Blog API',
    version: '1.0.0',
    description:
      'Session-authenticated REST API for a publishing platform with users, posts, comments, and likes.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Version 1',
    },
  ],
  tags: [
    { name: 'Users', description: 'Registration, authentication, and profile management' },
    { name: 'Posts', description: 'Published content, likes, and comments' },
  ],
  paths: {
    '/users/register': {
      post: {
        tags: ['Users'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'username', 'password'],
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  username: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created' },
          '409': { description: 'Duplicate email or username' },
        },
      },
    },
    '/users/login': {
      post: {
        tags: ['Users'],
        summary: 'Log in and create a session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated session created' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/users/logout': {
      post: {
        tags: ['Users'],
        summary: 'Destroy the current session',
        responses: {
          '200': { description: 'Logged out' },
          '401': { description: 'Authentication required' },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get the authenticated user profile',
        responses: {
          '200': { description: 'Current user profile' },
          '401': { description: 'Authentication required' },
        },
      },
    },
    '/posts': {
      get: {
        tags: ['Posts'],
        summary: 'List published posts with pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': { description: 'Paginated post list' },
        },
      },
      post: {
        tags: ['Posts'],
        summary: 'Create a post (admin only)',
        responses: {
          '201': { description: 'Post created' },
          '403': { description: 'Admin access required' },
        },
      },
    },
    '/posts/{id}': {
      get: {
        tags: ['Posts'],
        summary: 'Get one post and increment view count',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Post details' },
          '404': { description: 'Post not found' },
        },
      },
    },
    '/posts/{id}/like': {
      put: {
        tags: ['Posts'],
        summary: 'Toggle like on a post',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Like toggled' },
        },
      },
    },
    '/posts/{id}/comments': {
      get: {
        tags: ['Posts'],
        summary: 'List comments for a post',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Comment list' },
        },
      },
      post: {
        tags: ['Posts'],
        summary: 'Add a comment to a post',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '201': { description: 'Comment created' },
        },
      },
    },
  },
};
