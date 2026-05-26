import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [boxes, setBoxes] = useState([]);

  useEffect(() => {
    fetch('/api/boxes')
      .then(res => res.json())
      .then(data => setBoxes(data))
      .catch(err => console.error('Error fetching boxes:', err));
  }, []);

  return (
    <div>
      <h1>Seasonal Plant Boxes</h1>
      <div className="boxes-container">
        {boxes.map(box => (
          <div key={box.id} className="box-card">
            <h2>{box.name} ({box.season})</h2>
            <p>{box.description}</p>
            <h3>Contents:</h3>
            <ul>
              {box.contents.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <Link to={`/subscribe/${box.id}`}>
              <button>Subscribe</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
