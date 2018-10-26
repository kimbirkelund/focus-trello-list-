import { TrelloService, ICard } from "./services/trello";
import { autoinject } from "aurelia-framework";

@autoinject
export class App
{
  public message = 'Hello World!';
  public isAuthenticated = this._trello.isAuthenticated;
  public cards: ICard[] = null;

  constructor(private _trello: TrelloService) { }

  public async attached()
  {
    await this._trello.authenticate();

    let cards = await this._trello.getCards();
    this.cards = cards;
  }
}
