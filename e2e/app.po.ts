import { browser, element, by } from 'protractor';

export class NgFoundryPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('foundry-root h1')).getText();
  }
}
