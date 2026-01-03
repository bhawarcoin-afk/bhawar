import { Injectable, signal } from '@angular/core';
import { Mint } from '../types/mint';

@Injectable({
  providedIn: 'root',
})
export class MintService {
  private mints: Mint[] = [
    {
      mint_id: 'MUM',
      mint_name: 'Mumbai Mint',
      mint_mark: '◆ / B / M',
      location: 'Mumbai, Maharashtra',
      active_years: '1829-Present',
      identification_tip: 'Republic India: Diamond (◆) or "B" below the year. British India: Dot (.) or Diamond on the lotus/flower design on the reverse.'
    },
    {
      mint_id: 'KOL',
      mint_name: 'Kolkata Mint',
      mint_mark: 'No Mark / C',
      location: 'Kolkata, West Bengal',
      active_years: '1757-Present',
      identification_tip: 'Usually has NO Mint Mark below the year. If the area below the date is blank, it is likely Kolkata. Occasionally uses "C".'
    },
    {
      mint_id: 'HYD',
      mint_name: 'Hyderabad Mint',
      mint_mark: '★',
      location: 'Hyderabad, Telangana',
      active_years: '1903-Present',
      identification_tip: 'Look for a Star (★) below the date. Sometimes appears as a split diamond or dot in a diamond in older issues.'
    },
    {
      mint_id: 'NOI',
      mint_name: 'Noida Mint',
      mint_mark: '●',
      location: 'Noida, Uttar Pradesh',
      active_years: '1988-Present',
      identification_tip: 'A solid, round Dot (●) clearly visible below the year. Only found on Republic India coins issued after 1988.'
    },
    {
      mint_id: 'LAH',
      mint_name: 'Lahore Mint',
      mint_mark: 'L',
      location: 'Lahore, Pakistan (British India)',
      active_years: '1943-1947',
      identification_tip: 'The letter "L" below the date. Predominantly found on George VI coins from 1943 to 1947.'
    },
  ];

  mintsSignal = signal<Mint[]>(this.mints);

  getMints() {
    return this.mintsSignal;
  }
}