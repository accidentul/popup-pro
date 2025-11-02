import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialIndexes1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Indexes for popups table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_popups_shop_id ON popups(shop_id);
      CREATE INDEX IF NOT EXISTS idx_popups_status ON popups(status);
      CREATE INDEX IF NOT EXISTS idx_popups_active ON popups(shop_id, status, is_active) 
        WHERE status = 'active' AND is_active = true;
      CREATE INDEX IF NOT EXISTS idx_popups_created_at ON popups(created_at DESC);
    `);

    // Indexes for popup_views table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_popup_views_popup_id ON popup_views(popup_id);
      CREATE INDEX IF NOT EXISTS idx_popup_views_session_id ON popup_views(session_id);
      CREATE INDEX IF NOT EXISTS idx_popup_views_viewed_at ON popup_views(viewed_at DESC);
      CREATE INDEX IF NOT EXISTS idx_popup_views_popup_viewed ON popup_views(popup_id, viewed_at DESC);
    `);

    // Indexes for popup_conversions table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_popup_conversions_popup_id ON popup_conversions(popup_id);
      CREATE INDEX IF NOT EXISTS idx_popup_conversions_type ON popup_conversions(type);
      CREATE INDEX IF NOT EXISTS idx_popup_conversions_converted_at ON popup_conversions(converted_at DESC);
      CREATE INDEX IF NOT EXISTS idx_popup_conversions_popup_type ON popup_conversions(popup_id, type, converted_at DESC);
    `);

    // Indexes for discount_codes table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_discount_codes_shop_id ON discount_codes(shop_id);
      CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
      CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(shop_id, code, is_active) 
        WHERE is_active = true;
    `);

    // Indexes for email_subscribers table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_email_subscribers_shop_id ON email_subscribers(shop_id);
      CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
      CREATE INDEX IF NOT EXISTS idx_email_subscribers_popup_id ON email_subscribers(popup_id);
      CREATE INDEX IF NOT EXISTS idx_email_subscribers_active ON email_subscribers(shop_id, is_active) 
        WHERE is_active = true;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscribers_unique ON email_subscribers(shop_id, email) 
        WHERE is_active = true;
    `);

    // Indexes for ab_test_groups table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ab_test_groups_shop_id ON ab_test_groups(shop_id);
      CREATE INDEX IF NOT EXISTS idx_ab_test_groups_status ON ab_test_groups(status);
      CREATE INDEX IF NOT EXISTS idx_ab_test_groups_running ON ab_test_groups(shop_id, status) 
        WHERE status = 'running';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popups_shop_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popups_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popups_active;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popups_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popup_views_popup_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popup_views_session_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popup_views_viewed_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popup_views_popup_viewed;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popup_conversions_popup_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popup_conversions_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popup_conversions_converted_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_popup_conversions_popup_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_discount_codes_shop_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_discount_codes_code;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_discount_codes_active;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_email_subscribers_shop_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_email_subscribers_email;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_email_subscribers_popup_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_email_subscribers_active;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_email_subscribers_unique;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ab_test_groups_shop_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ab_test_groups_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ab_test_groups_running;`);
  }
}


