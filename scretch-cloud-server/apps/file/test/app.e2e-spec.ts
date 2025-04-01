import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { FileModule } from './../src/file.module';

describe('FileController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FileModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`test case`, () => {
    expect(1).toBe(1)
  })
});
