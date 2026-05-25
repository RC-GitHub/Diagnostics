import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TestResult {
  id: string;
  name: string;
  category: 'Blood' | 'Imaging' | 'Genetic' | 'Urine';
  date: string;
  value: string;
  status: 'Normal' | 'Warning' | 'Critical';
}

@Component({
  selector: 'app-profile',
  standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.html',
    styleUrls: ['./profile.scss']
  })
  export class ProfileComponent implements OnInit {
    // Global App States
    userName: string = 'Jan Kowalski';
    selectedCategory: string = 'All';
    searchQuery: string = '';

    // Health Metrics Overview
    healthMetrics = [
      { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', trend: 'Stable', status: 'success' },
      { label: 'Heart Rate', value: '72', unit: 'BPM', trend: 'Normal', status: 'success' },
      { label: 'Glucose Level', value: '104', unit: 'mg/dL', trend: 'Elevated', status: 'warning' },
      { label: 'Cholesterol', value: '210', unit: 'mg/dL', trend: 'High', status: 'critical' }
    ];

    // Raw Medical Database Records
    allResults: TestResult[] = [
      { id: '1', name: 'Morphology (CBC)', category: 'Blood', date: '2026-05-12', value: '4.8 M/µL RBC', status: 'Normal' },
      { id: '2', name: 'TSH (Thyroid)', category: 'Blood', date: '2026-05-10', value: '4.2 µIU/mL', status: 'Warning' },
      { id: '3', name: 'Lumbar Spine MRI', category: 'Imaging', date: '2026-04-28', value: 'L4-L5 Disc Herniation', status: 'Critical' },
      { id: '4', name: 'Lipid Profile', category: 'Blood', date: '2026-04-15', value: '210 mg/dL Total', status: 'Critical' },
      { id: '5', name: 'Urinalysis Basic', category: 'Urine', date: '2026-04-02', value: 'Clear / Negative', status: 'Normal' }
    ];

    filteredResults: TestResult[] = [];

    ngOnInit(): void {
      this.applyFilters();
    }

    // Pure functional logic for search and tab selections
    applyFilters(): void {
      this.filteredResults = this.allResults.filter(result => {
        const matchesCategory = this.selectedCategory === 'All' || result.category === this.selectedCategory;
        const matchesSearch = result.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              result.value.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }

    setCategory(category: string): void {
      this.selectedCategory = category;
      this.applyFilters();
    }
  }
