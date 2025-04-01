import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { StorageModule } from './../src/storage.module';

describe('StorageController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`test case`, () => {
    expect(1).toBe(1)
  })
});
