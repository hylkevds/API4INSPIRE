import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConnectorService } from '../connector.service';
import { SqlService } from '../sql.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  //The table names that will be displayed
  tableNames = [];

  //The columnnames that will be displayed
  columnNames = [];
  //columnConfigNames = [];

  //The connectors loaded from the config file
  connectors: any = [];

  //The connector which is selected 
  selectedConnector: any;

  //The important links from the config file
  importantLinks: any = ["Lukas", "Tobias", "Kathi", "Klaus"];

  showCols: boolean = false;
  showRenameTable: boolean = false;
  showRenameCol: boolean = false;

  tableSelect: boolean = false;
  idTableSelected: string = "";

  columnSelected: boolean = false;
  idColumnSelected: string = "";

  renameTableForm: FormGroup;
  tableNameSubmitted: boolean = false;

  renameColumnForm: FormGroup;
  columnNameSubmitted: boolean = false;

  sqlForm: FormGroup;
  sqlSubmitted: boolean = false;

  addImportantLinkFrom: FormGroup;
  addLinkSubmitted: boolean = false;

  sqlSucess: boolean = true;

  checkedTable:boolean = false;
  checkedColumn: boolean = false;

  constructor(private formBuilder: FormBuilder, private conService: ConnectorService, private sqlService: SqlService) { }

  async ngOnInit() {
    //Init the forms to rename the tables and columns and to execute the sql query
    this.sqlForm = this.formBuilder.group({
      collectionId: ['', Validators.required],
      sqlQuery: ['', Validators.required]
    });

    this.addImportantLinkFrom = this.formBuilder.group({
      addLink: ['', Validators.required]
    });

    this.renameTableForm = this.formBuilder.group({
      tableName: ['', Validators.required]
    });

    this.renameColumnForm = this.formBuilder.group({
      columnName: ['', Validators.required]
    });

    //Load all the connectors from the config
    this.connectors = await this.conService.getConnector();

    if(this.connectors.length == 0){
      this.connectors = [{id: "No Connectors"}];
    }

    var select = document.getElementById("selectField") as HTMLSelectElement;
    var index = select.selectedIndex;
    
    if(index == -1){index = 0}
  
      this.selectedConnector = this.connectors[index];
      //Load the table names from the selected connector
      this.tableNames = await this.conService.getTables({'id': this.selectedConnector.id });
      console.log(this.selectedConnector);

      //Event when another conneector in the dropdown is selected
      select.onchange = async (event: any)=>{
        var select = document.getElementById("selectField") as HTMLSelectElement;
        this.selectedConnector = this.connectors[select.selectedIndex];

        this.tableNames = await this.conService.getTables({'id': this.selectedConnector.id });
        this.tableSelect = false;
      }
  }

  /**
   * Handle the click event when a table row with table names is clicked
   *
   * @param name the name or the id of the table row that has been clicked
   */
  async onClickTableName(name: string) {
    // If a "tablename row" is already selected, then
    // you have to change the style
    if(this.tableSelect) {
      var change = document.getElementById(this.idTableSelected);
      change.style.backgroundColor = "white";
      change.style.color = "black";

      // If a "columnname row" is also selected
      // then you have to deselect is
      if(this.columnSelected) {
        var col = document.getElementById(this.idColumnSelected)
        col.style.backgroundColor = "white";
        col.style.color = "black";

        this.columnSelected = false;
        this.showRenameCol = false;
      }
    }

    // Change the style of the selected row
    // and save the id of it
    var row = document.getElementById(name);
    row.style.color = "white";
    row.style.backgroundColor = "#0069D9";
    this.showRenameTable = true;
    this.tableSelect = true;
    this.idTableSelected = name;
    this.showCols = true;

    this.columnNames = await this.conService.getColumn({'id': this.selectedConnector.id, 'table':''+name});
  }

  /**
   * Handle the click event when a table row with columns is clicked
   *
   * @param name the name or id of the table row that has been clicked
   */
  onClickColumn(name: string) {
    // If a "columnname row" is already selected
    // it has to be deselected
    if(this.columnSelected) {
      var change = document.getElementById(this.idColumnSelected);
      change.style.backgroundColor = "white";
      change.style.color = "black";
    }

    // Change the style of the selected row
    // and save the id of it
    var row = document.getElementById(name);
    row.style.color = "white";
    row.style.backgroundColor = "#0069D9";
    this.showRenameCol = true;
    this.idColumnSelected = name;
    this.columnSelected = true;
  }

  /**
   * Handle the click event when the new table name is submitted
   */
  submitTable() {
    this.tableNameSubmitted = true;
    if(this.renameTableForm.invalid) {
      return;
    }

    //Init the JSON for the backend
    var json = {
      'id': this.selectedConnector.id,
      'orgName': this.idTableSelected,
      'alias': this.renameTableForm.value.tableName
    };

    this.conService.renameTable(json).then(
      async ()=>{
        this.reload();
        console.log(this.selectedConnector);
      }
    ).catch(()=>{
      alert("Not renamed")
    });

  }

  /**
   * Handle the click event when the new column name is submitted
   */
  submitColumn() {
    this.columnNameSubmitted = true;
    if(this.renameColumnForm.invalid) {
      return;
    }

    //Init the JSON for the backend
    var json = {
      'id': this.selectedConnector.id,
      'table': this.idTableSelected,
      'alias': this.renameColumnForm.value.columnName,
      'orgName': this.idColumnSelected
    };

    this.conService.renameColumn(json).then(async()=>{
      this.reload();
      this.columnNames = await this.conService.getColumn({'id': this.selectedConnector.id, 'table':''+this.idTableSelected});
    }).catch(()=>{
      alert("Not renamed")
    });

  }

  /**
   * Reload the connectors and tables
   */
  async reload() {
    this.connectors = await this.conService.getConnector();

    var select = document.getElementById("selectField") as HTMLSelectElement;
    this.selectedConnector = this.connectors[select.selectedIndex]

    this.tableNames = await this.conService.getTables({'id': this.selectedConnector.id }); //{'id':'Inspire'}

  }

  /**
   * Reload and load the new tables
   */
  async loadNewTables() {
    var select = document.getElementById("selectField") as HTMLSelectElement;
    this.selectedConnector = this.connectors[select.selectedIndex]

    this.tableNames = await this.conService.getTables({'id': this.selectedConnector.id });
  }

  /**
   * Handle the "execute" event for the sql query
   */
  executeSQL(check: boolean) {
    this.sqlSubmitted = true;
    if(this.sqlForm.invalid) {
      return;
    }

    var json = {
      'id': this.selectedConnector.id,
      'sql': this.sqlForm.value.sqlQuery,
      'collectionName': this.sqlForm.value.collectionId,
      'check':check
    };

    this.sqlService.executeSQL(json).then(
      async ()=>{
        alert("SQL executed successfully")
      }
    ).catch((err)=>{
      this.sqlSucess = false;
      var errorText = document.getElementById('sqlError');
      errorText.innerHTML = err;
      alert("Not executed successfully")
    });

  }

  /**
   * Handle the exclude event when the checkbox is changed in the tables
   */
  excludeTable(tableName: string) {
    console.log(tableName + " excluded");
  }

  
  /**
   * Handle the click event when a column should be used as ID
   */
  useAsId()  {
    var checkbox = document.getElementById("useAsId") as HTMLInputElement;
    var checked:boolean = checkbox.checked;
    var setTo: boolean;
    if(checked) {
      setTo = false;
    } else {
      setTo = true;
    }
    console.log(this.idColumnSelected + " is now id: " + setTo);
  }

  /**
   * Handle the click event when a column should be used as geometry
   */
  useAsGeometry() {
    var checkbox = document.getElementById("useAsGeometry") as HTMLInputElement;
    var checked:boolean = checkbox.checked;
    var setTo: boolean;
    if(checked) {
      setTo = false;
    } else {
      setTo = true;
    }
    console.log(this.idColumnSelected + " is now geometry: " + setTo);
  }

  /**
   * Handle the click event when all tables should be included or excluded
   */
  excludeAllTables() {
    var tables:any = document.getElementsByClassName("excludeTable");
    var exlcudeAll:any = document.getElementById("exludeAllTables");
    if(exlcudeAll.checked) {
      // After clicking the checkbox is checked
      // so all og the tables will be exluded   
      for(var i = 0; i < tables.length; i++) {
        tables[i].checked = "checked";
      }
    } else {
      // After clicking the checkbox is not checked
      // so all of the tables will be included
      for(var i = 0; i < tables.length; i++) {
        tables[i].checked = false;
      }
    }
  }

  /**
   * Handle the click event when all the columns should be included or excluded
   */
  excludeAllColumns() {
    var columns:any = document.getElementsByClassName("excludeColumn");
    var but:any = document.getElementById("excludeAllColumns")
    if(but.checked) {
      for(var i = 0; i < columns.length; i++) {
        columns[i].checked = "checked";
      }
    } else {
      for(var i = 0; i < columns.length; i++) {
        columns[i].checked = false;
      }
    }
    
  }

  addImportantLink() {
    this.addLinkSubmitted = true;
    if(this.addImportantLinkFrom.invalid) {
      return;
    }
    console.log("Added important link")
  }
}