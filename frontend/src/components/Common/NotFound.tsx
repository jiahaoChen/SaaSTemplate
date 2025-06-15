import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import styled from 'styled-components'

const NotFoundContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 16px;
`

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  z-index: 1;
`

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  margin-left: 16px;
`

const ErrorCode = styled.h1`
  font-size: 6rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.85);

  .dark & {
    color: rgba(255, 255, 255, 0.85);
  }

  @media (max-width: 768px) {
    font-size: 4rem;
  }
`

const ErrorTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.85);

  .dark & {
    color: rgba(255, 255, 255, 0.85);
  }
`

const ErrorMessage = styled.p`
  font-size: 1.125rem;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 16px;
  text-align: center;
  z-index: 1;

  .dark & {
    color: rgba(255, 255, 255, 0.65);
  }
`

const ButtonContainer = styled.div`
  z-index: 1;
`

const NotFound = () => {
  return (
    <>
      <NotFoundContainer data-testid="not-found">
        <ContentWrapper>
          <TextContainer>
            <ErrorCode>404</ErrorCode>
            <ErrorTitle>Oops!</ErrorTitle>
          </TextContainer>
        </ContentWrapper>

        <ErrorMessage>
          The page you are looking for was not found.
        </ErrorMessage>
        
        <ButtonContainer>
          <Link to="/">
            <Button
              type="primary"
              style={{
                marginTop: '16px',
                alignSelf: 'center'
              }}
            >
              Go Back
            </Button>
          </Link>
        </ButtonContainer>
      </NotFoundContainer>
    </>
  )
}

export default NotFound
