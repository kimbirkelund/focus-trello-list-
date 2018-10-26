import { App } from '../../src/app';
import { TrelloService } from "../../src/services/trello";

describe('the app', () =>
{
  it('says hello', () =>
  { 
    expect(new App(new TrelloService()).message).toBe('Hello World!');
  });
});
