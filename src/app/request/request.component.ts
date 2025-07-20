import { Component, OnInit } from '@angular/core';
import { RequestService } from '../services/request.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
})
export class RequestComponent implements OnInit {
  requests: any[] = [];
  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.fetchRequests();
  }

  fetchRequests() {
    this.requestService.fetchRequests().subscribe({
      next: (res) => {
        this.requests = res;
      },
      error: (err) => {
        console.error('Error while fetching requests', err);
      },
    });
  }

  approve(name: string, event: Event) {
    event.stopPropagation();
    console.log('Approved:', name);
    const params = new HttpParams().set('name', name.trim());
    this.requestService.approveRequests(params).subscribe({
      next: (res) => {
        this.fetchRequests();
      },
      error: (err) => {
        console.error('Error approving requests');
      },
    });
  }

  rejectRequest(name: string, event: Event) {
    event.stopPropagation();
    console.log('Rejected:', name);
    const params = new HttpParams().set('name', name);
    this.requestService.rejectRequests(params).subscribe({
      next: (res) => {
        this.fetchRequests();
      },
      error: (err) => {
        console.error('Error rejecting requests');
      },
    });
  }

  
}
