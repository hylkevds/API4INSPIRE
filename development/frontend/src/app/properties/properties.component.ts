import { Component, OnInit } from '@angular/core';

import * as $ from 'jquery';
import { ConnectorService } from '../connector.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {

  sqlite: boolean = false;
  postgres: boolean = false;

  connectorNameForm: FormGroup;
  connectorNameSubmitted: boolean = false;

  changeUsernameForm: FormGroup;
  changeUserSubmitted: boolean = false;

  changePasswordForm: FormGroup;
  changePasswordSubmitted: boolean = false;

  changeHostnameForm: FormGroup;
  changeHostnameSubmitted: boolean = false;

  changePortForm: FormGroup;
  changePortSubmitted: boolean = false;

  changeSchemaForm: FormGroup;
  changeSchmemaSubmitted: boolean = false;

  selectedConnector: any;

  connectors: any = [{"id":"No connectors are currently available"}];

  constructor(private con: ConnectorService, private formBuilder: FormBuilder, private conService: ConnectorService) { }

  async ngOnInit() {

    this.connectorNameForm = this.formBuilder.group({
      conName: ['', Validators.required]
    });

    this.changeUsernameForm = this.formBuilder.group({
      newName: ['', Validators.required]
    });

    this.changePasswordForm = this.formBuilder.group({
      newPwd: ['', Validators.required],
      reNewPwd: ['', Validators.required]
    });
  
    this.changeHostnameForm = this.formBuilder.group({
      hostname: ['', Validators.required]
    });

    this.changePortForm = this.formBuilder.group({
      newPort: ['', Validators.required]
    });

    this.changeSchemaForm = this.formBuilder.group({
      newSchema: ['', Validators.required]
    });

    this.sqlite = true;

    //Load all connectors
    this.connectors = await this.con.getConnector();
    this.connectors.push({"id":"Lukas", "class": "PostgreSQL"})
    
    console.log(this.connectors);

    var sel = document.getElementById('connector') as HTMLSelectElement;
    this.selectedConnector = this.connectors[0];

    //Change the form depending on what connector it is
    sel.onchange = (event: any)=>{
      var cal = event.target.options[event.target.selectedIndex].getAttribute('id');
      this.selectedConnector = this.connectors[sel.selectedIndex];

      if(cal.includes("PostgreSQL")) {
        this.sqlite = false;
        this.postgres = true;
      } else if(cal.includes("SQLite")) {
        this.sqlite = true;
        this.postgres = false;
      }
    }
  }

  submitConnectorName() {
    this.connectorNameSubmitted = true;
    if(this.connectorNameForm.invalid) {
      return;
    }
  }

  changeUsername() {
    this.changeUserSubmitted = true;
    if(this.changeUsernameForm.invalid) {
      return;
    }
  }

  changePassword() {
    this.changePasswordSubmitted = true;
    if(this.changePasswordForm.invalid) {
      return;
    }
  }

  changeHostname() {
    this.changeHostnameSubmitted = true;
    if(this.changeHostnameForm.invalid) {
      return;
    } 
  }

  changePort() {
    this.changePortSubmitted = true;
    if(this.changePortForm.invalid) {
      return;
    }
  }

  changeSchema() {
    this.changeSchmemaSubmitted = true;
    if(this.changeSchemaForm.invalid) {
      return;
    }
  }

}