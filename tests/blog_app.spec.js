const { test, describe, expect, beforeEach } = require('@playwright/test');
const { loginWith, createBlog } = require('./helper.js');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');
    await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'pass123'
      }
    });

    await page.goto('');
  });

  test('Login form is shown', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'pass123');
      await expect(page.getByText('Test User logged in')).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'wrongpass');
      await expect(page.getByText('Wrong username or password')).toBeVisible();

      const errorDiv = await page.locator('text=Wrong username or password').first();
      await expect(errorDiv).toContainText('Wrong username or password');
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)');
      await expect(errorDiv).toHaveCSS('border', '2px solid rgb(255, 0, 0)');
      await expect(page.getByText('Test User logged in')).not.toBeVisible();
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'testuser', 'pass123');
    });

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'Test Blog', 'testuser', 'http://test.com');
      await expect(page.getByTestId('notification')).toHaveText('A new blog "Test Blog" by testuser added');
    });

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'Test Blog', 'testuser', 'http://test.com');
      });

      test('a blog can be liked', async ({ page }) => {
        await page.reload();
                
        const blogPost = page.locator('text=Test Blog testuser');
        await blogPost.waitFor({ state: 'visible' });
       
        const toggleButton = blogPost.locator('button', { hasText: 'view' });
        await toggleButton.click();

        const likeButton = page.getByRole('button', { name: 'like' });
        await likeButton.click();

        await page.waitForTimeout(1000);

        const likesLocator = page.getByTestId('likes');
        const updatedLikesText = await likesLocator.innerText();
        const updatedLikes = parseInt(updatedLikesText.match(/\d+/)[0]);
        expect(updatedLikes).toBe(1); 
      });
    });  
  });
});

