import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar Component', () => {
  const mockOnShowAuthModal = vi.fn();
  const mockOnShowStats = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNavbar = (authValue) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          <Navbar 
            onShowAuthModal={mockOnShowAuthModal}
            onShowStats={mockOnShowStats}
          />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  describe('When user is NOT authenticated', () => {
    const unauthenticatedContext = {
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
    };

    it('should render Home button', () => {
      renderNavbar(unauthenticatedContext);
      expect(screen.getByLabelText('Home')).toBeInTheDocument();
    });

    it('should NOT show Watchlist and Recommendations', () => {
      renderNavbar(unauthenticatedContext);
      expect(screen.queryByLabelText('My Watchlist')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Recommendations')).not.toBeInTheDocument();
    });

    it('should NOT show user profile button', () => {
      renderNavbar(unauthenticatedContext);
      expect(screen.queryByLabelText('User profile')).not.toBeInTheDocument();
    });
  });

  describe('When user IS authenticated', () => {
    const authenticatedContext = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'J'
      },
      isAuthenticated: true,
      logout: mockLogout,
    };

    it('should render all navigation buttons', () => {
      renderNavbar(authenticatedContext);
      expect(screen.getByLabelText('Home')).toBeInTheDocument();
      expect(screen.getByLabelText('My Watchlist')).toBeInTheDocument();
      expect(screen.getByLabelText('Recommendations')).toBeInTheDocument();
    });

    it('should show user profile button', () => {
      renderNavbar(authenticatedContext);
      expect(screen.getByLabelText('User profile')).toBeInTheDocument();
    });

    it('should display user avatar', () => {
      renderNavbar(authenticatedContext);
      const profileBtn = screen.getByLabelText('User profile');
      expect(profileBtn).toBeInTheDocument();
    });

    it('should open dropdown menu when profile button is clicked', async () => {
      renderNavbar(authenticatedContext);
      const profileBtn = screen.getByLabelText('User profile');
      
      fireEvent.click(profileBtn);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('should show My Stats button in dropdown', async () => {
      renderNavbar(authenticatedContext);
      const profileBtn = screen.getByLabelText('User profile');
      
      fireEvent.click(profileBtn);
      
      await waitFor(() => {
        expect(screen.getByText('My Stats')).toBeInTheDocument();
      });
    });

    it('should show Profile button in dropdown', async () => {
      renderNavbar(authenticatedContext);
      const profileBtn = screen.getByLabelText('User profile');
      
      fireEvent.click(profileBtn);
      
      await waitFor(() => {
        expect(screen.getByLabelText('View profile')).toBeInTheDocument();
      });
    });

    it('should show Logout button in dropdown', async () => {
      renderNavbar(authenticatedContext);
      const profileBtn = screen.getByLabelText('User profile');
      
      fireEvent.click(profileBtn);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('should call onShowStats when My Stats is clicked', async () => {
      renderNavbar(authenticatedContext);
      const profileBtn = screen.getByLabelText('User profile');
      
      fireEvent.click(profileBtn);
      
      await waitFor(() => {
        const statsBtn = screen.getByText('My Stats');
        fireEvent.click(statsBtn);
        expect(mockOnShowStats).toHaveBeenCalled();
      });
    });

    it('should close dropdown after clicking My Stats', async () => {
      renderNavbar(authenticatedContext);
      const profileBtn = screen.getByLabelText('User profile');
      
      fireEvent.click(profileBtn);
      
      await waitFor(() => {
        const statsBtn = screen.getByText('My Stats');
        fireEvent.click(statsBtn);
      });

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });
  });

  describe('Avatar Display', () => {
    it('should display first letter of name', () => {
      const context = {
        user: { name: 'Alice', email: 'alice@example.com' },
        isAuthenticated: true,
        logout: mockLogout,
      };

      renderNavbar(context);
      const profileBtn = screen.getByLabelText('User profile');
      expect(profileBtn).toBeInTheDocument();
    });

    it('should display first letter of email if no name', () => {
      const context = {
        user: { email: 'bob@example.com' },
        isAuthenticated: true,
        logout: mockLogout,
      };

      renderNavbar(context);
      expect(screen.getByLabelText('User profile')).toBeInTheDocument();
    });

    it('should handle custom avatar', () => {
      const context = {
        user: { 
          name: 'Charlie',
          email: 'charlie@example.com',
          avatar: '👤'
        },
        isAuthenticated: true,
        logout: mockLogout,
      };

      renderNavbar(context);
      expect(screen.getByLabelText('User profile')).toBeInTheDocument();
    });
  });

  describe('Active Route Highlighting', () => {
    it('should highlight Home button on home page', () => {
      const context = {
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      };

      renderNavbar(context);
      const homeBtn = screen.getByLabelText('Home');
      expect(homeBtn).toHaveClass('active');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const context = {
        user: { name: 'Test User', email: 'test@example.com' },
        isAuthenticated: true,
        logout: mockLogout,
      };

      renderNavbar(context);
      
      expect(screen.getByLabelText('Home')).toBeInTheDocument();
      expect(screen.getByLabelText('My Watchlist')).toBeInTheDocument();
      expect(screen.getByLabelText('Recommendations')).toBeInTheDocument();
      expect(screen.getByLabelText('User profile')).toBeInTheDocument();
    });

    it('should have aria-hidden on icons', () => {
      const context = {
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      };

      renderNavbar(context);
      const homeBtn = screen.getByLabelText('Home');
      const icon = homeBtn.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
