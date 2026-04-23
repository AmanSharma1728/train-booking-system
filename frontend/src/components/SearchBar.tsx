import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';
import './SearchBar.scss';

interface SearchBarProps {
  variant?: 'glass' | 'standard';
}

const SearchBar: React.FC<SearchBarProps> = ({ variant = 'standard' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [values, setValues] = useState({
    source: searchParams.get('source') || 'New Delhi',
    destination: searchParams.get('destination') || 'Mumbai Central',
    date: searchParams.get('date') || '2026-05-10'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams(values).toString();
    navigate(`/search?${query}`);
  };

  return (
    <form className={`search-bar ${variant}`} onSubmit={handleSearch}>
      <div className="search-inputs">
        <div className="input-group">
          <label><MapPin size={14} /> From</label>
          <input 
            type="text" 
            placeholder="Departure Station" 
            value={values.source}
            onChange={(e) => setValues({...values, source: e.target.value})}
            required
          />
        </div>
        
        <div className="input-group">
          <label><MapPin size={14} /> To</label>
          <input 
            type="text" 
            placeholder="Arrival Station" 
            value={values.destination}
            onChange={(e) => setValues({...values, destination: e.target.value})}
            required
          />
        </div>

        <div className="input-group">
          <label><Calendar size={14} /> Date</label>
          <input 
            type="date" 
            value={values.date}
            onChange={(e) => setValues({...values, date: e.target.value})}
            required
          />
        </div>
      </div>

      <button type="submit" className="search-btn btn-primary">
        <Search size={20} />
        <span>Search Trains</span>
      </button>
    </form>
  );
};

export default SearchBar;
