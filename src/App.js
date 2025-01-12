import './App.css';

import React, { useEffect, useState, useRef } from 'react';

function App() {
  
  const [data, setData] = useState([]);
  const [error, setError] = useState(null); 
  const [isMobileSize, setIsMobileSize] = useState(window.innerWidth <= 768);
  
  const [displayedData, setDisplayedData] = useState([]);
  
  const [sortCategory, setSortCategory] = useState("Date");
  const [sortDirection, setSortDirection] = useState("Descending");
  const [sortDropdownIsOpen, setSortDropdownIsOpen] = useState(false);
  const dropdownRef = useRef(null); const dropdownRef2 = useRef(null);
  
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [minRevenue, setMinRevenue] = useState("");
  const [maxRevenue, setMaxRevenue] = useState("");
  const [minIncome, setMinIncome] = useState("");
  const [maxIncome, setMaxIncome] = useState("");
  const [filterDropdownIsOpen, setFilterDropdownIsOpen] = useState(false);
  const dropdownRef3 = useRef(null); const dropdownRef4 = useRef(null);
  
  const yearPlaceholder = "xxxx";
  const numberPlaceholder = "(In Millions)";
  
  const normalizationNumber = 1000000;
  
  useEffect(() => {
    
    
    //api call -> https://financialmodelingprep.com/api/v3/income-statement/AAPL?period=annual&apikey=vY0JT0vgXT8lcO1BvFpl55nnOKF7DIBF
    //api call to test scrolling table -> https://financialmodelingprep.com/api/v3/search?query=AA&apikey=vY0JT0vgXT8lcO1BvFpl55nnOKF7DIBF
    // let api = "https://financialmodelingprep.com/api/v3/search?query=AA&apikey=vY0JT0vgXT8lcO1BvFpl55nnOKF7DIBF" //api call to test scrolling table
    let api = "https://financialmodelingprep.com/api/v3/income-statement/AAPL?period=annual&apikey=vY0JT0vgXT8lcO1BvFpl55nnOKF7DIBF" //api call
    fetch(api)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
      })
      .catch(error => {
        setError(error);
        console.log(error);
      });
    
    //if you click outside either dropdown, that dropdown will close
    const handleClickOutside = (event) => {
      if (dropdownRef.current && dropdownRef2.current && !dropdownRef.current.contains(event.target) && !dropdownRef2.current.contains(event.target)) {
        setSortDropdownIsOpen(false);
      }
      if (dropdownRef3.current && dropdownRef4.current && !dropdownRef3.current.contains(event.target) && !dropdownRef4.current.contains(event.target)) {
        setFilterDropdownIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    //keeps track of the window size for conditional rendering and displaying
    const handleWindowResize = () => {
      setIsMobileSize(window.innerWidth <= 768);
    }
    
    window.addEventListener('resize', handleWindowResize);
    
    //dismount (cleans up to prevent memory leaks)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleWindowResize);
    };
      
  }, []);
  
  //initialized displayed data as soon as the data is fetched... data stores the original, displayedData is the filtered/sorted version
  useEffect(() => {
    let newDisplayedData = data;
    setDisplayedData(newDisplayedData);
  }, [data]);
  
  //toggle dropdowns
  const toggleSortDropdown = () => 
  {
    setSortDropdownIsOpen(!sortDropdownIsOpen);
  }
  
    const toggleFilterDropdown = () =>
  {
    setFilterDropdownIsOpen(!filterDropdownIsOpen);
  }
  
  
  //handle changing sort type, direction, or filters
  const handleSortTypeSelection = (category) =>
  {
    setSortCategory(category);
    setSortDropdownIsOpen(false);
    sortDisplayedData(displayedData, category, sortDirection);
  }
  
  const handleSortDirectionChange = (direction) =>
  {
    setSortDirection(direction);
    sortDisplayedData(displayedData, sortCategory, direction);
  }
  
  const handleFilterDataChange = (filterCategory, value) =>
  {
    //ignore any input that isn't a number or a comma
    let lastLetter = value.charAt(value.length-1);
    if((lastLetter < '0' || lastLetter > '9') && lastLetter !==',') value = value.substring(0, value.length-1); 
    
    //set the correct data point to 'value'
    switch(filterCategory)
    {
      case "minDate":
        setMinDate(value); break;
      case "maxDate":
        setMaxDate(value); break;
      case "minRevenue":
        setMinRevenue(value); break;
      case "maxRevenue":
        setMaxRevenue(value); break;
      case "minIncome":
        setMinIncome(value); break;
      case "maxIncome":
        setMaxIncome(value); break;
      default:
        console.log("No valid value entered");
    }
  }
  
  const handleApplyFilters = () =>
  {
    setFilterDropdownIsOpen(false);
    //set default values to be current values before change
    let minYear = minDate === "" ? '0000' : minDate;
    let maxYear = maxDate === "" ? ((new Date().getFullYear())+1).toString() : maxDate;
    let minRev = minRevenue === "" ? 0 : parseInt(minRevenue.replace(/,/g, ""), 10) * normalizationNumber; //allows for commas in the input strings
    let maxRev = maxRevenue === "" ? Number.MAX_SAFE_INTEGER : parseInt(maxRevenue.replace(/,/g, ""), 10) * normalizationNumber; //allows for commas in the input strings
    let minNetIncome = minIncome === "" ? 0 : parseInt(minIncome.replace(/,/g, ""), 10) * normalizationNumber; //allows for commas in the input strings
    let maxNetIncome = maxIncome === "" ? Number.MAX_SAFE_INTEGER : parseInt(maxIncome.replace(/,/g, ""), 10) * normalizationNumber; //allows for commas in the input strings
    
    //format date correctly to include years before 2000
    while(minYear.length < 4) minYear = '0'+minYear;
    while(maxYear.length < 4) maxYear = '0'+maxYear;
    
    minYear = new Date(minYear + '-01-01');
    maxYear = new Date(maxYear + '-12-31');
    
    //add the correct filtered data as the new displayed-data
    let newData = [];
    for(let entry of data)
    {
      let date = new Date(entry.date);
      let rev = +entry.revenue;
      let netIncome = +entry.netIncome;
      
      if(date >= minYear && date <= maxYear && rev >= minRev && rev <= maxRev && netIncome >= minNetIncome && netIncome <= maxNetIncome)
      {
        newData.push(entry);
      }
    }
    
    sortDisplayedData(newData, sortCategory, sortDirection);
  }
  
  const handleClearFilters = () =>
  {
    setFilterDropdownIsOpen(false);
    
    setMinDate("");
    setMaxDate("");
    setMinRevenue("");
    setMaxRevenue("");
    setMinIncome("");
    setMaxIncome("");
    
    sortDisplayedData(data, sortCategory, sortDirection);
  }
  
  const sortDisplayedData = (dataToDisplay, category, direction) =>
  {
    if(category === "Date")
    {
      if(direction === "Descending") setDisplayedData(dataToDisplay.sort((a, b) => new Date(b.date) - new Date(a.date)));
      else if(direction === "Ascending") setDisplayedData(dataToDisplay.sort((a, b) => new Date(a.date) - new Date(b.date)));
    }
    else if(category === "Revenue")
    {
      if(direction === "Descending") setDisplayedData(dataToDisplay.sort((a, b) => b.revenue - a.revenue));
      else if(direction === "Ascending") setDisplayedData(dataToDisplay.sort((a, b) => a.revenue - b.revenue));
    }
    else if(category === "Net Income")
    {
      if(direction === "Descending") setDisplayedData(dataToDisplay.sort((a, b) => b.netIncome - a.netIncome));
      else if(direction === "Ascending") setDisplayedData(dataToDisplay.sort((a, b) => a.netIncome - b.netIncome));
    }
  }
  
  
  
  return (
    <div className="min-h-screen bg-white flex">
      
      <nav className="bg-white p-4 fixed top-0 left-0 right-0 z-10">
          <div className="flex items-center justify-center h-16">
            <div>
              <p className="text-2xl font-bold text-black justify-center">Financial Data Filtering App</p>
              <h2 className="text-m font-bold text-valueglance justify-center"> -- AAPL financial data</h2>
            </div>
          </div>
      </nav>

      
      <div className="flex-col w-full px-5 pt-24">
        
        
        {error && <div>Error encountered: {error}</div>}
        
        
        <div className="relative pt-6 lg:ml-[8.33%]">
          <div className="flex">
            {/*dropdown button for sorting*/}
            <button className="relative inline-flex items-center px-4 py-2 bg-valueglance text-white rounded-md hover:shadow-lg mr-4" onClick={toggleSortDropdown} ref={dropdownRef}>
              Sort by: {sortCategory} ({sortDirection})
              {!sortDropdownIsOpen && (
                <svg className="ml-2 w-3 h-3 text-white transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              )}
              {sortDropdownIsOpen && (
                <svg className="ml-2 w-3 h-3 text-white transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              )}
            </button>
            {/*dropdown button for filters*/}
            <button className="relative inline-flex items-center px-4 py-2 bg-valueglance text-white rounded-md hover:shadow-lg ml-4" onClick={toggleFilterDropdown} ref={dropdownRef3}>
              Filter options
              {!filterDropdownIsOpen && (
                <svg className="ml-2 w-3 h-3 text-white transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              )}
              {filterDropdownIsOpen && (
                <svg className="ml-2 w-3 h-3 text-white transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              )}
            </button>
          </div>
          {sortDropdownIsOpen && (
            <div className="absolute mt-2 w-60 bg-white border border-gray-300 rounded-md shadow-lg z-20" ref={dropdownRef2}>
              <ul className="text-gray-700">
                <li className="px-4 pt-4 pb-2 flex justify-between">
                  <label>Ascending <input type="radio" value="Ascending" onChange={(e) => handleSortDirectionChange("Ascending")} checked={sortDirection === "Ascending"}></input></label>
                  <label>Descending <input type="radio" value="Descending" onChange={(e) => handleSortDirectionChange("Descending")} checked={sortDirection === "Descending"}></input></label>
                </li>
                <hr style={{ border: '1px solid grey' }} />
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSortTypeSelection("Date")}>Date</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSortTypeSelection("Revenue")}>Revenue</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSortTypeSelection("Net Income")}>Net Income</li>
              </ul>
            </div>
          )}
          
          {filterDropdownIsOpen && (
            <div className="absolute mt-2 bg-white border border-gray-300 rounded-md shadow-lg w-full md:w-1/2 lg:w-1/4 z-20" ref={dropdownRef4}>
              <ul className="text-gray-700">
                <li className="px-4 py-2 cursor-pointer font-bold"> Year </li>
                <li className="px-4 py-2 cursor-pointer relative inline-flex items-center">
                  Min: 
                  <input
                    type="text"
                    placeholder={yearPlaceholder}
                    value={minDate}
                    onChange={(e) => handleFilterDataChange("minDate", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md m-1"
                  />
                  Max:
                  <input
                    type="text"
                    placeholder={yearPlaceholder}
                    value={maxDate}
                    onChange={(e) => handleFilterDataChange("maxDate", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md m-1"
                  />
                </li>
                <hr style={{ border: '1px solid grey' }} />
                <li className="px-4 py-2 cursor-pointer font-bold"> Revenue </li>
                <li className="px-4 py-2 cursor-pointer relative inline-flex items-center">
                  Min:
                  <input
                    type="text"
                    placeholder={numberPlaceholder}
                    value={minRevenue}
                    onChange={(e) => handleFilterDataChange("minRevenue", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md m-1"
                  />
                  Max:
                  <input
                    type="text"
                    placeholder={numberPlaceholder}
                    value={maxRevenue}
                    onChange={(e) => handleFilterDataChange("maxRevenue", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md m-1"
                  />
                </li>
                <hr style={{ border: '1px solid grey' }} />
                <li className="px-4 py-2 cursor-pointer font-bold"> Net Income </li>
                <li className="px-4 py-2 cursor-pointer relative inline-flex items-center">
                  Min:
                  <input
                    type="text"
                    placeholder={numberPlaceholder}
                    value={minIncome}
                    onChange={(e) => handleFilterDataChange("minIncome", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md m-1"
                  />
                  Max:
                  <input
                    type="text"
                    placeholder={numberPlaceholder}
                    value={maxIncome}
                    onChange={(e) => handleFilterDataChange("maxIncome", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md m-1"
                  />
                </li>
                <hr style={{ border: '1px solid grey' }} />
                <li className="flex justify-center">
                  <button className="relative inline-flex items-center px-2 bg-valueglance text-white rounded-md hover:shadow-lg m-2" onClick={handleApplyFilters}>
                    Apply Filters
                  </button>
                  <button className="relative inline-flex items-center px-2 bg-valueglance text-white rounded-md hover:shadow-lg m-2" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        {/*table for displaying information*/}
        
        <div className="overflow-x-auto mt-6 mb-16 max-h-screen">
          <div className="lg:ml-[8.33%] sticky top-0 bg-white">
            <span className="italic">*In millions of dollars</span>
          </div>
          <table className="table-auto border-separate border-spacing-0 border-l border-r border-black lg:w-10/12 mx-auto w-full">
            <thead>
              <tr className="text-right sticky top-6 bg-white z-10 border-black">
                <th className="border-b border-t border-r border-black px-4 py-2 lg:w-1/12">Date</th>
                <th className="border-b border-t border-black px-4 py-2">Revenue*</th>
                <th className="border-b border-t border-black px-4 py-2">Net Income*</th>
                <th className="border-b border-t border-black px-4 py-2">Gross Profit*</th>
                <th className="border-b border-t border-black px-4 py-2">EPS</th>
                <th className="border-b border-t border-black px-4 py-2">Operating Income*</th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {displayedData && displayedData.map((entry, index) => (
                <tr key={entry.date} className={`${index % 2 === 0 ? 'bg-gray-200' : 'bg-white'} text-right`}>
                  <td className="border-b border-r border-black px-4 py-2 whitespace-nowrap lg:w-1/12">{entry.date}</td>
                  <td className="border-b border-black px-4 py-2">{new Intl.NumberFormat().format(entry.revenue / normalizationNumber)}</td>
                  <td className="border-b border-black px-4 py-2">{new Intl.NumberFormat().format(entry.netIncome / normalizationNumber)}</td>
                  <td className="border-b border-black px-4 py-2">{new Intl.NumberFormat().format(entry.grossProfit / normalizationNumber)}</td>
                  <td className="border-b border-black px-4 py-2">{entry.eps}</td>
                  <td className="border-b border-black px-4 py-2">{new Intl.NumberFormat().format(entry.operatingIncome / normalizationNumber)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
      
    </div>
  );
}

export default App;
