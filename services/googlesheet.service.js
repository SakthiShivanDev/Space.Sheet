import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
import { checkValueExist } from "../utils/common.utils.js";
dotenv.config();
const private_key = `${process.env.GOOGLE_PRIVATE_KEY}`;

export class SpreadsheetService {
  constructor(sheetId,email,key) {
    this.serviceAccountAuth = new JWT({
      email:email?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:checkValueExist(key)?private_key.replace(/\\n/g, "\n"):key.replace(/\\n/g, "\n"),
      scopes: [process.env.GOOGLE_SHEET_SCOPE],
    });
    this.sheetId = sheetId;
    this.doc = new GoogleSpreadsheet(
      this.sheetId ?? sheetId,
      this.serviceAccountAuth
    );
  }
  async addSheet(title, headers) {
    try {
      await this.doc.loadInfo();
      await this.doc.addSheet({ title: title, headerValues: headers });
      console.log(`sheet created :: title=${title},sheetId=${this.sheetId}`);
      return { success: true, message: "sheet added" };
    } catch (err) {
      return { success: false, message: err.response ?? err };
    }
  }
  async addRow(title, data) {
    try {
      await this.doc.loadInfo();
      const sheet =
        title === "" || title === undefined
          ? this.doc.sheetsByIndex[0]
          : this.doc.sheetsByTitle[title];
      await sheet.addRow({ ...data }).catch((err) => {
        throw err;
      });
      return { success: true, message: "row added" };
    } catch (err) {
      console.log(err)
      return { success: false, message: err.response ?? err };
    }
  }

  async getRows(title) {
    try {
      await this.doc.loadInfo();
      const sheet =
        title === "" || title === undefined
          ? this.doc.sheetsByIndex[0]
          : this.doc.sheetsByTitle[title];
      const sheetData = await sheet.getRows();
      const data = [];
      sheetData.map((e) => data.push(e.toObject()));
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.response.data ?? err };
    }
  }
  async updateSheet(title, data) {
    try {
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByTitle[title];
      const sheetData = await sheet.updateProperties({ title: data.title });
      return { success: true, message: "updated" };
    } catch (err) {
      return { success: false, message: err.response.data ?? err };
    }
  }
  async deleteSheet(title) {
    try {
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByTitle[title];
      await sheet.delete();
      return { success: true, message: "deleted" };
    } catch (err) {
      return { success: false, message: err.response.data ?? err };
    }
  }
}