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
  private _reloadTimeout;

  public message = "Hello World!";
  public columnClass = "pure-u-1-3";
  public isAuthenticated = this._trello.isAuthenticated;
  public cards: ICardVm[] = null;
  public columns = 3;
  public listName: string;
  public isLoading = false;

  constructor(private _trello: TrelloService) { }

  public async attached()
  {
    await this._trello.authenticate();

    await this.reload();
  }

  public detached()
  {
    clearTimeout(this._reloadTimeout);
  }

  private async reload()
  {
    this.isLoading = true;

    const list = await this._trello.getList();

    this.listName = list.name;
    const cards = await this._trello.getCards();
    const members = await this._trello.getMembers();

    const memberMap: { [id: string]: IMember; } = {};

    members.forEach(m => memberMap[m.id] = m);

    const labels = await this._trello.getLabels();
    const labelMap = {};

    labels.filter(l => l.name)
      .forEach(l => labelMap[l.id] = l.color);

    this.cards = cards.map(c =>
    {
      return {
        name: c.name,
        members: c.idMembers.map(m => memberMap[m]).map(m => m.fullName),
        color: c.idLabels && c.idLabels.length > 0 ? labelMap[c.idLabels[0]] : null
      };
    });

    this.isLoading = false;

    this._reloadTimeout = setTimeout(this.reload.bind(this), 5000);
  }

  public addColumn()
  {
    this.columns++;
    if (this.columns > 5)
      this.columns = 5;

    this.updateColumnClass();
  }

  private updateColumnClass()
  {
    this.columnClass = `pure-u-1-${this.columns}`;
  }

  public subtractColumn()
  {
    this.columns--;
    if (this.columns < 1)
      this.columns = 1;

    this.updateColumnClass();
  }
}
