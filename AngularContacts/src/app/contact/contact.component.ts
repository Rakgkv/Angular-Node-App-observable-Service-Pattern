import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { IContact } from 'src/app/models/contactModel';
import { MatTableDataSource } from '@angular/material';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormGroupDirective
} from '@angular/forms';
import { HomeService } from '../home/home.service';


@Component({
  selector: 'app-contacts',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.Emulated
})
export class ContactComponent implements OnInit {
  contacts: IContact[];
  displayedColumns: string[] = ['name', 'surname', 'number', 'birthDay', 'address', 'action'];
  dataSource: MatTableDataSource<IContact>;
  contactForm: FormGroup;
  isEdit: boolean;
  constructor(private route: ActivatedRoute, private router: Router,
              private formBuilder: FormBuilder,  private homeService: HomeService) { }


  filteredValues = {
    name: '', surname: '', number: '',
    birthDay: '', address: ''
  };
  nameFilter = new FormControl('');
  surnameFilter = new FormControl('');


  ngOnInit() {
    this.getContactList();
    this.initializeForm();

    this.nameFilter.valueChanges
      .subscribe(
        name => {
          this.filteredValues.name = name;
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        }
      );
    this.surnameFilter.valueChanges
      .subscribe(
        surname => {
          this.filteredValues.surname = surname;
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        }
      );
  }

  initializeForm(): void {
    this.contactForm = this.formBuilder.group({
      _id: new FormControl(''),
      name: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
      number: new FormControl('', [
        Validators.required,
        Validators.minLength(13),
        Validators.pattern('^\\d{3}-\\d{4}-\\d{4}$')
      ]),
      birthday: new FormControl(null),
      address: new FormControl(null)
    });
  }

   tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data): boolean => {
      const searchTerms = this.filteredValues;
      if (searchTerms.name.length > 0 && searchTerms.surname.length > 0) {
        return data.name.toLowerCase().includes(searchTerms.name.toLowerCase()) &&
          data.surname.toLowerCase().includes(searchTerms.surname.toLowerCase());
      } else if (searchTerms.name.length > 0) {
        return data.name.toLowerCase().includes(searchTerms.name.toLowerCase());
      } else if (searchTerms.surname.length > 0) {
        return data.surname.toLowerCase().includes(searchTerms.surname.toLowerCase());
      }
      return true;
    };
    return filterFunction;
  }

  onSubmit(formDirective: FormGroupDirective) {
    if (!this.contactForm.invalid) {
     // console.log(this.contactForm.value);
      if (this.isEdit) {
         this.updateContact(this.contactForm.value);
       } else {
        this.saveContact(this.contactForm.value);
       }
      formDirective.resetForm();
      this.contactForm.reset();
    }
  }



  onEdit(row: IContact) {
    this.contactForm.patchValue({
      _id: row._id,
      name: row.name,
      surname: row.surname,
      number: row.number,
      birthday: row.birthday,
      address: row.address
    });
    this.isEdit = true;
  }


  getContactList() {
      this.homeService.getContact()
        .subscribe(
          result => {
            if (result !== undefined) {
              this.contacts = result;
              console.log(this.contacts);
              this.dataSource = new MatTableDataSource(this.contacts);
              this.dataSource.filterPredicate = this.tableFilter();
            }
          },
          err => {
           // this.toastr.error(err);
          }
        );
    }

    saveContact(values: any) {
      const contact =  values as IContact;
      this.homeService.saveContact(contact)
        .subscribe(
          result => {
            if (result !== undefined) {
              console.log(this.contacts);
              this.getContactList();
             // this.toastr.success('Saved contact successfully');
            }
          },
          err => {
           // this.toastr.error(err);
          }
        );

    }

    updateContact(values: any) {
      const contact =  values as IContact;
      this.homeService.updateContact(contact)
        .subscribe(
          result => {
            if (result !== undefined) {
              console.log(this.contacts);
              this.getContactList();
             // this.toastr.success('Updated contact successfully');
            }
          },
          err => {
           // this.toastr.error(err);
          }
        );

    }

    deleteContact(deleteId: string) {
      this.homeService.deleteContact(deleteId)
        .subscribe(
          result => {
            if (result !== undefined) {
              console.log(this.contacts);
              this.getContactList();
             // this.toastr.success('Deleted contact successfully');
            }
          },
          err => {
           // this.toastr.error(err);
          }
        );

    }
}
