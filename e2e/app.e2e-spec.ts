import { NgFoundryPage } from './app.po';

describe('ng-foundry App', () => {
  let page: NgFoundryPage;

  beforeEach(() => {
    page = new NgFoundryPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
