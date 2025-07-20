import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  userDetails: any = null;
  loading = true;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (res) => {
        this.userDetails = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.error = 'Failed to load user profile. Please try again.';
        this.loading = false;
      },
    });
  }
}
