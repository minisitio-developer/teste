import React, { useState, useEffect } from 'react';

function TagsInput(props) {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (Array.isArray(props.tags)) {
      setTags(props.tags);
      return;
    }

    if (props.value != undefined && props.value.length > 0) {
      const parsedTags = Array.isArray(props.value) ? props.value : JSON.parse(props.value);
      setTags(parsedTags);
    }
  }, [props.value, props.tags]);

/*   useEffect(() => {
    if (!props.hasUserInteracted.current) return;
    props.tagValue(tags);

    if (tags.length > 0) {
      props.setMinisitio({
        ...props.minisitio,
        tags: JSON.stringify(tags)
      });

      props.hasUserInteracted.current = true;
      console.log(props.minisitio)
    }

  }, [tags]); */

  const handleInputChange = (e) => {
    //props.hasUserInteracted.current = true;
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      if (tags.length < 10 && !tags.includes(inputValue.trim())) {
        const nextTags = [...tags, inputValue.trim()];
        setTags(nextTags);
        setInputValue('');
        props.tagValue(nextTags)
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length) {
      const nextTags = tags.slice(0, -1);
      setTags(nextTags);
      props.tagValue(nextTags);

    }
  };

  const removeTag = (indexToRemove) => {
    const nextTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(nextTags);
    props.tagValue(nextTags);
  };

  return (
    <div style={containerStyle}>
      <div style={tagsContainerStyle}>
        {tags.map((tag, index) => (
          <div key={index} style={tagStyle}>
            {tag}
            <span style={removeTagStyle} onClick={() => removeTag(index)}>
              &times;
            </span>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          style={inputStyle}
          placeholder="Adicionar marcadores (tag's max 10 unidades)"
        />
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  height: '150px',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#FFF',
  borderRadius: '4px'
};

const tagsContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  /*  border: '1px solid #ccc', */
  padding: '5px',
  borderRadius: '5px',
  maxWidth: '100%',
  width: '100%',
};

const tagStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '5px',
  margin: '5px',
  backgroundColor: '#FFCC29',
  color: 'white',
  borderRadius: '5px',
  fontSize: '14px',
};

const removeTagStyle = {
  marginLeft: '8px',
  cursor: 'pointer',
};

const inputStyle = {
  border: 'none',
  outline: 'none',
  padding: '5px',
  fontSize: '14px',
  flex: '1',
  minWidth: '150px',
};

export default TagsInput;
