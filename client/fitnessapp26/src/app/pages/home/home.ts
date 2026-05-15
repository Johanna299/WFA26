import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'fa-home',
  standalone: true,
  imports: [RouterLink, MatButton],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {}
