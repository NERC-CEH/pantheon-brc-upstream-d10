import {
  Fragment,
  createContext,
  useEffect,
  useRef,
  useState,
} from '@wordpress/element';

const TabsContext = createContext(0);

const Tabs = ({ children, selectedTab = 1 }) => {
  const [activeTab, setActiveTab] = useState(selectedTab);

  useEffect(() => {
    setActiveTab(selectedTab);
  }, [selectedTab]);

  return (
    <Fragment>
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        {children}
      </TabsContext.Provider>
    </Fragment>
  );
};

const TabList = ({ children }) => (
  <ul role="tablist" className="tabs">
    {children}
  </ul>
);

const Tab = ({ children }) => {
  const ref = useRef(null);
  const [index, setIndex] = useState(null);

  function getIndex() {
    if (!ref.current) {
      return null;
    }
    return Array.from(ref.current.parentNode.children).indexOf(ref.current);
  }

  useEffect(() => {
    setIndex(getIndex());
  }, [ref]);

  return (
    <TabsContext.Consumer>
      {({ activeTab, setActiveTab }) => (
        <li
          role="tab"
          tabIndex="0"
          ref={ref}
          className={`tabs__tab-item ${activeTab === index ? 'is-active' : ''}`}
          onClick={() => setActiveTab(index)}
        >
          {children}
        </li>
      )}
    </TabsContext.Consumer>
  );
};

const TabPanel = ({ children }) => {
  const ref = useRef(null);
  const [index, setIndex] = useState(null);

  function getIndex() {
    if (!ref.current) {
      return null;
    }
    return Array.from(
      ref.current.parentNode.querySelectorAll('.tabs__tab-panel'),
    ).indexOf(ref.current);
  }

  useEffect(() => {
    setIndex(getIndex());
  }, [ref]);

  return (
    <TabsContext.Consumer>
      {({ activeTab }) => (
        <div
          role="tabpanel"
          ref={ref}
          tabIndex="0"
          className={`tabs__tab-panel ${
            activeTab === index ? 'is-active' : 'hidden'
          }`}
        >
          {children}
        </div>
      )}
    </TabsContext.Consumer>
  );
};

export { Tabs, TabList, Tab, TabPanel };
