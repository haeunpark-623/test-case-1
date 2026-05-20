// Conduit seed — 10 users + 20 tags + 50 articles + 200 article_tags + 200 favorites + 100 follows + 300 comments
// password_hash placeholder: bcrypt of "password" (10 round). 운영 무효 — be-auth-signup #3에서 실 회원가입 flow 박제 시 별 seed.
// faker locale=en (RealWorld 공식 데이터셋과 일관). seed value 고정으로 결정적 출력.

import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

faker.seed(20260527);

// bcrypt of "password" (10 round). 모든 seed user가 같은 placeholder 해시 사용 — dev 전용.
const PLACEHOLDER_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    // 1) Users 10
    const users = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        prisma.user.create({
          data: {
            email: `user${i + 1}@conduit.example.com`,
            username: `user${i + 1}_${faker.internet.userName().toLowerCase().replace(/[^a-z0-9_-]/g, '')}`.slice(0, 30),
            password_hash: PLACEHOLDER_HASH,
            bio: faker.lorem.sentence(),
            image: faker.image.avatar(),
          },
        }),
      ),
    );

    // 2) Tags 20
    const tagNames = [
      'react', 'vue', 'angular', 'svelte', 'solid',
      'typescript', 'javascript', 'rust', 'go', 'python',
      'devops', 'docker', 'kubernetes', 'aws', 'gcp',
      'ai', 'ml', 'webdev', 'graphql', 'fastapi',
    ];
    const tags = await Promise.all(
      tagNames.map((name) => prisma.tag.create({ data: { name } })),
    );

    // 3) Articles 50
    const articles = await Promise.all(
      Array.from({ length: 50 }, (_, i) => {
        const author = users[i % users.length];
        const title = faker.lorem.sentence({ min: 3, max: 7 }).replace(/\.$/, '');
        return prisma.article.create({
          data: {
            slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}-${i + 1}`,
            title,
            description: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(3, '\n\n'),
            author_id: author.id,
          },
        });
      }),
    );

    // 4) ArticleTag 200 (글당 평균 4 tags)
    const articleTagPairs = new Set<string>();
    for (const article of articles) {
      const shuffled = [...tags].sort(() => faker.number.float() - 0.5);
      for (const tag of shuffled.slice(0, 4)) {
        articleTagPairs.add(`${article.id}:${tag.id}`);
      }
    }
    await prisma.articleTag.createMany({
      data: Array.from(articleTagPairs).map((pair) => {
        const [article_id, tag_id] = pair.split(':').map(Number);
        return { article_id, tag_id };
      }),
      skipDuplicates: true,
    });

    // 5) Favorites 200 (글당 평균 4 favorites)
    const favPairs = new Set<string>();
    for (const article of articles) {
      const shuffled = [...users].sort(() => faker.number.float() - 0.5);
      for (const user of shuffled.slice(0, 4)) {
        favPairs.add(`${user.id}:${article.id}`);
      }
    }
    await prisma.favorite.createMany({
      data: Array.from(favPairs).map((pair) => {
        const [user_id, article_id] = pair.split(':').map(Number);
        return { user_id, article_id };
      }),
      skipDuplicates: true,
    });

    // 6) Follows 100 (랜덤 짝, self-follow 제외)
    const followPairs = new Set<string>();
    while (followPairs.size < 100) {
      const follower = users[faker.number.int({ min: 0, max: users.length - 1 })];
      const followee = users[faker.number.int({ min: 0, max: users.length - 1 })];
      if (follower.id === followee.id) continue;
      followPairs.add(`${follower.id}:${followee.id}`);
    }
    // 10 user 사이 가능한 (follower, followee) 짝은 90개 → 100개 도달 불가. 90개로 cap.
    const followData = Array.from(followPairs).slice(0, 90).map((pair) => {
      const [follower_id, followee_id] = pair.split(':').map(Number);
      return { follower_id, followee_id };
    });
    await prisma.follow.createMany({ data: followData, skipDuplicates: true });

    // 7) Comments 300 (글당 평균 6 comments)
    const commentData = articles.flatMap((article) =>
      Array.from({ length: 6 }, () => ({
        body: faker.lorem.sentences({ min: 1, max: 3 }),
        article_id: article.id,
        author_id: users[faker.number.int({ min: 0, max: users.length - 1 })].id,
      })),
    );
    await prisma.comment.createMany({ data: commentData });

    console.log('[seed] done', {
      users: users.length,
      tags: tags.length,
      articles: articles.length,
      article_tags: articleTagPairs.size,
      favorites: favPairs.size,
      follows: followData.length,
      comments: commentData.length,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
