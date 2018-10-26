interface ITrello
{
  get(path: string, params?: any, success?: (r) => void, error?: (e) => void): void;
  authorize(opts: { type: "redirect" | "popup"; name: string; scope: { read?: boolean, write?: boolean, account?: boolean }; expiration: string; success?: () => void; error?: () => void; interactive?: boolean }): void;
}

export interface ICard
{
  title: string;
}

export class TrelloService
{
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

  public getCards(): Promise<ICard[]>
  {
    if (!this._isAuthenticated)
      return Promise.reject("First authenticate.");

    return new Promise((resolve, reject) =>
    {
      this._trello.get(
        "/lists/5bb9f470dc761f35d5daeff8/cards",
        undefined,
        cards =>
        {
          resolve(cards);
        },
        e => reject(e));
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
}
