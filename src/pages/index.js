import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout, Hero, About, Jobs, Featured, Projects, Contact } from '@components';
import { showProjects } from '@config';

const StyledMainContainer = styled.main`
  counter-reset: section;
`;

const IndexPage = ({ location, data }) => (
  <Layout location={location}>
    <StyledMainContainer className="fillHeight">
      <Hero />
      <About image={data.headshot} />
      <Jobs data={data} />
      <Featured data={data} />
      {showProjects && <Projects data={data} />}
      <Contact />
    </StyledMainContainer>
  </Layout>
);

IndexPage.propTypes = {
  data: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default IndexPage;

export async function getStaticProps() {
  const { getHomeData } = require('@lib/content.cjs');
  return { props: { data: await getHomeData() } };
}
