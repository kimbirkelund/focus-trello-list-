import { TrelloService, ICard, IMember } from "./services/trello";
import { autoinject } from "aurelia-framework";

interface ICardVm
{
  name: string;
  members: string[];
  color: string;
}

@autoinject
export class App
{
  public message = "Hello World!";
  public isAuthenticated = this._trello.isAuthenticated;
  public cards: ICardVm[] = null;
  public columns = 3;
  public listName: string;

  constructor(private _trello: TrelloService) { }

  public async attached()
  {
    await this._trello.authenticate();

    const list = await this._trello.getList();
    this.listName = list.name;

    const cards = await this._trello.getCards();

    const members = await this._trello.getMembers();
    const memberMap: { [id: string]: IMember } = {};
    members.forEach(m => memberMap[m.id] = m);

    const labels = await this._trello.getLabels();
    const labelMap = {};
    labels.filter(l => l.name).forEach(l => labelMap[l.id] = l.color);

    this.cards = cards.map(c =>
    {
      return {
        name: c.name,
        members: c.idMembers.map(m => memberMap[m]).map(m => m.fullName),
        color: c.idLabels && c.idLabels.length > 0 ? labelMap[c.idLabels[0]] : null
      }
    });
  }
}
