interface ITrello
{
  get(path: string, params?: any, success?: (r) => void, error?: (e) => void): void;
  authorize(opts: { type: "redirect" | "popup"; name: string; scope: { read?: boolean, write?: boolean, account?: boolean }; expiration: string; success?: () => void; error?: () => void; interactive?: boolean }): void;
  deauthorize(): void;
}

export interface ICard
{
  name: string;
  desc: string;
  idLabels: string[];
  idMembers: string[];
  closed: boolean;
}

export interface IList
{
  id: string;
  name: string
}

export interface IMember
{
  id: string;
  fullName: string;
}

export interface ILabel
{
  color: string;
  id: string;
  name: string;
}

export class TrelloService
{
  private static readonly ListId = "5bb9f470dc761f35d5daeff8";
  private static readonly OrganizationId = "5bb9f46625b53c5b1dc8d9ba";
  private static readonly BoardId = "5bb9f470dc761f35d5daeff6";

  private _trello: ITrello
  private _isAuthenticated;

  public get isAuthenticated() { return this._isAuthenticated; }

  constructor()
  {
    this._trello = (window as any).Trello;
    if (!this._trello)
      throw new Error("window.Trello is undefined.");

    this.doAuthorize(false);
  }

  public authenticate()
  {
    this.doAuthorize(true);
  }

  public getList(): Promise<IList>
  {
    if (!this._isAuthenticated)
      return Promise.reject("First authenticate.");

    return new Promise((resolve, reject) =>
    {
      this._trello.get(
        `/lists/${TrelloService.ListId}`,
        undefined,
        list =>
        {
          resolve(list);
        },
        e => this.handleError(e, reject));
    });
  }

  public getCards(): Promise<ICard[]>
  {
    if (!this._isAuthenticated)
      return Promise.reject("First authenticate.");

    return new Promise((resolve, reject) =>
    {
      this._trello.get(
        `/lists/${TrelloService.ListId}/cards`,
        undefined,
        cards =>
        {
          resolve(cards);
        },
        e => this.handleError(e, reject));
    });
  }

  public getLabels(): Promise<ILabel[]>
  {
    if (!this._isAuthenticated)
      return Promise.reject("First authenticate.");

    return new Promise((resolve, reject) =>
    {
      this._trello.get(
        `/boards/${TrelloService.BoardId}/labels?fields=all`,
        undefined,
        labels =>
        {
          resolve(labels);
        },
        e => this.handleError(e, reject));
    });
  }

  public getMembers(): Promise<IMember[]>
  {
    if (!this._isAuthenticated)
      return Promise.reject("First authenticate.");

    return new Promise((resolve, reject) =>
    {
      this._trello.get(
        `/board/${TrelloService.BoardId}/members?members=all&member_fields=all`,
        undefined,
        members =>
        {
          resolve(members);
        },
        e => this.handleError(e, reject));
    });
  }

  private doAuthorize(interactive: boolean)
  {
    return new Promise((resolve, reject) =>
    {
      this._trello.authorize({
        type: "redirect",
        name: "Getting Started Application",
        scope: {
          read: true
        },
        expiration: "1day",
        interactive: interactive,
        success: () =>
        {
          this._isAuthenticated = true;
          resolve();
        },
        error: () =>
        {
          this._isAuthenticated = false;
          reject();
        }
      });
    });
  }

  private handleError(e: any, reject: (reason?: any) => void)
  {
    if (e.status === 401)
    {
      this._trello.deauthorize();
      this.authenticate();
    }

    reject(e);
  }
}
