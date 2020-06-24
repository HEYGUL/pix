import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | user-certifications-detail-competences-list', function() {
  setupRenderingTest();

  it('renders', async function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<UserCertificationsDetailCompetencesList />`);

    expect(this.element.textContent.trim()).to.equal('');

    // Template block usage:
    await render(hbs`
      <UserCertificationsDetailCompetencesList>
        template block text
      </UserCertificationsDetailCompetencesList>
    `);

    expect(this.element.textContent.trim()).to.equal('template block text');
  });
});
