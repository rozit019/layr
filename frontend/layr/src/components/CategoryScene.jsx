import './CategoryScene.css';

export default function CategoryScene({ category }) {
  return (
    <div className={`category-scene category-scene--${category.key}`} aria-label={`${category.label} website preview`}>
      <div className="scene-halo" />
      <div className="scene-sticker"><span>{category.icon}</span><b>MAKE IT<br />YOUR STORY</b></div>
      <div className="scene-browser">
        <div className="scene-browser-bar"><span><i /><i /><i /></span><small>{category.key}.layr.page</small><span>↗</span></div>
        <div className={`scene-site scene-site--${category.key}`}>
          <div className="scene-nav"><b>{category.sceneBrand.split('·')[0]}</b><span>ABOUT&nbsp;&nbsp; MEMORIES&nbsp;&nbsp; HELLO</span></div>
          <div className="scene-body">
            <div className="scene-copy"><small>{category.eyebrow}</small><strong>{category.sceneTitle}</strong><span>MAKE THIS PAGE YOURS&nbsp; ↗</span></div>
            <div className={`scene-visual scene-visual--${category.key}`} aria-hidden="true">
              {category.key === 'portfolio' && <><i className="scene-work scene-work-one" /><i className="scene-work scene-work-two" /><i className="scene-work scene-work-three" /><b>PROJECT<br />01 — 04</b></>}
              {category.key === 'birthday' && <><i className="scene-balloon scene-balloon-one" /><i className="scene-balloon scene-balloon-two" /><i className="scene-cake-layer scene-cake-top" /><i className="scene-cake-layer scene-cake-bottom" /><b>HAPPY<br />BIRTHDAY</b></>}
              {category.key === 'proposal' && <><i className="scene-ring" /><i className="scene-heart">♡</i><b>JUST<br />US TWO</b></>}
              {category.key === 'anniversary' && <><i className="scene-photo scene-photo-one" /><i className="scene-photo scene-photo-two" /><i className="scene-photo scene-photo-three" /><b>OUR LITTLE<br />TIMELINE</b></>}
            </div>
          </div>
          <div className="scene-bottom"><span>A PAGE FULL OF LITTLE THINGS</span><span>01&nbsp; / &nbsp;03</span></div>
        </div>
      </div>
      <div className="scene-share"><span>↗</span><b>Made to be shared</b></div>
    </div>
  );
}
